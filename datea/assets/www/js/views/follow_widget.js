
var FollowWidgetBaseView = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'follow-widget',
	
	is_active: true,
	
	initialize: function () {
		
		var follow_key = this.options.object_type+'.'+this.options.object_id;
		
		var ufollows = localUser.get('follows');
		if (ufollows && ufollows.length > 0) {
			var follow_data = _.find(ufollows, function(item){
				return item.follow_key == follow_key;
			});
			if (follow_data) this.model = new Follow(follow_data);
		}
		if (typeof(this.model) == 'undefined') {
			this.model = new Follow({
				follow_key: follow_key,
				object_type: this.options.object_type,
				object_id: this.options.object_id,
			});
		}		
		this.followed_model = this.options.followed_model;
		
		this.$el.addClass(this.options.object_type);
		if (this.options.read_only) this.$el.addClass('read-only');
		
	},
	
	events: {
		'tap': 'follow',
	},
	
	render: function (ev) {
		var context = this.build_tpl_context(); 
		this.$el.html(this.template(context));
		this.apply_state_classes();
		return this;
	},
	
	build_tpl_context: function() {
		var context = this.model.toJSON();
		
		context.follow_count = this.followed_model.get('follow_count');
		if (this.options.is_own) {
			context.follow_count--;
			if (context.follow_count < 0) context.follow_count = 0;
		}
		
		if (this.model.isNew()) {
			context.label = 'seguir';
		}else if (this.options.read_only) {
			context.label = 'siguen';
		}else{
			context.label = 'siguiendo';
		}
		return context;
	},
	
	apply_state_classes: function() {
		if (!this.model.isNew()) {
			this.$el.addClass('active');
		}else{
			this.$el.removeClass('active');
		}
	},
	
	follow: function(ev) {
		ev.preventDefault();
		
		if (this.is_active == true) {
			this.is_active = false;
		}else{
			return;
		}
		
		if (this.options.read_only) return;
		
		this.$el.addClass('loading');
		//Datea.show_small_loading(this.$el);
		
		var set_options = {};
		if (this.options.silent) set_options.silent = true; 
		
		if (this.model.isNew()) {
			var self = this;
			this.model.save({}, {
				success: function (model, response) {
					self.followed_model.set('follow_count', self.followed_model.get('follow_count') + 1, set_options);
					self.render();
					self.$el.removeClass('loading');
					self.is_active = true;
					if (self.options.object_type == 'dateaaction') localUser.follows_actions = true;
					if (!localUser.attributes.follows) localUser.set('follows', []);
					localUser.attributes.follows.push(self.model.toJSON());
					if (self.options.follow_callback) self.options.follow_callback(model);
				},
				error: function(error) {
					onOffline();
					self.is_active = true;
				}
			});
			
		}else {
			
			var self = this;
			this.model.destroy({
				success: function( mdl, resp) {
					var id = self.model.get('id');
					localUser.set('follows', _.reject(localUser.get('follows'), function (item){
						if (item.id == id) return true;
					}));
					if(self.options.unfollow_callback) self.options.unfollow_callback();
					self.model = new Follow({
						object_type: self.model.get('object_type'),
						object_id: self.model.get('object_id'),
						follow_key: self.model.get('follow_key'),
					});
					self.followed_model.set('follow_count', self.followed_model.get('follow_count') - 1, set_options);
					self.render();
					self.$el.removeClass('loading');
					self.is_active = true;
				},
				error: function (err) {
					onOffline();
					self.is_active = true;
				}
			});
			
		}
	},
	
});

var FollowActionWidgetView = FollowWidgetBaseView.extend({
	
	render: function (ev) {
		var context = this.build_tpl_context(); 
		this.$el.html(this.template(context));
		this.apply_state_classes();
		return this;
	},
});

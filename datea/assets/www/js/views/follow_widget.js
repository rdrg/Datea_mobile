
var FollowWidgetBaseView = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'follow-widget',
	
	initialize: function () {
		
		var follow_key = this.options.object_type+'.'+this.options.object_id;
		
		var ufollows = localUser.get('follows');
		if (ufollows && ufollows.length > 0) {
			var follow_data = _.find(ufollows, function(item){
				return item.follow_key == follow_key;
			});
			this.model = new Follow(follow_data);
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
		'click': 'follow',
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
			context.label = 'no seguir';
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
		console.log(localSession);
		
		if (this.options.read_only) return;
		
		this.$el.addClass('loading');
		//Datea.show_small_loading(this.$el);
		
		var set_options = {};
		if (this.options.silent) set_options.silent = true; 
		
		if (this.model.isNew()) {
			var self = this;
			this.model.save({},{
				success: function (model, response) {
					console.log("hey");
					self.render();
					self.$el.removeClass('loading');
				}
			});
			localUser.attributes.follows.push(this.model.toJSON());
			this.followed_model.set('follow_count', this.followed_model.get('follow_count') + 1, set_options);
			
		}else {
			var id = this.model.get('id');
			localUser.set('follows', _.reject(localUser.get('follows'), function (item){
				if (item.id == id) return true;
			}));
			this.model.destroy();
			this.model = new Datea.Follow({
				object_type: this.model.get('object_type'),
				object_id: this.model.get('object_id'),
				follow_key: this.model.get('follow_key'),
			});
			this.followed_model.set('follow_count', this.followed_model.get('follow_count') - 1, set_options);
			this.render();
			this.$el.removeClass('loading');
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

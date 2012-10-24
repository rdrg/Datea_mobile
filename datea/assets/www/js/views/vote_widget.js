/* 
 * INIT WITH
 * {
 * 	model: <voted model instance>
 *  object_type: <lowercase string of object type>
 *  object_id: <int> 	
 * 	voted_model: <model_instance_to_vote_on>,
 * }
 */

var VoteWidgetView = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'vote-widget',
	
	initialize: function () {
		this.voted_model = this.options.voted_model;
		//this.model.bind('sync', this.sync, this);
		var self = this;
		var uvotes = localUser.get('votes');
		if (uvotes && uvotes.length > 0) {
			var vote_data = _.find(uvotes, function(item){
				return item.object_type == self.options.object_type && item.object_id == self.options.object_id;
			});
			if (vote_data) this.model = new Vote(vote_data);
		}
		if (typeof(this.model) == 'undefined') {
			this.model = new Vote({
				object_type: this.options.object_type,
				object_id: this.options.object_id,
			});
		}
		this.$el.addClass(this.options.object_type);
		if (this.options.read_only) this.$el.addClass('read-only');
		if (this.options.add_class) this.$el.addClass(this.options.add_class);
	},
	
	events: {
		'click': 'vote',
	},
	
	render: function (ev) {
		var context = this.model.toJSON();
		context.vote_count = this.voted_model.get('vote_count');
		
		if (this.model.isNew()) {
			context.label = 'apoyar';
		}else{
			context.label = 'apoyando';
		}
		this.$el.html( this.template(context));

		if (!this.model.isNew()) {
			this.$el.addClass('active');
		}else{
			this.$el.removeClass('active');
		}
		return this;
	},

	
	vote: function(ev) {
		ev.preventDefault();
		// for the moment, votes cannot be deleted
		if (this.options.read_only) return;
		 
		if (this.model.isNew()) {
			//Datea.show_small_loading(this.$el);
			this.$el.addClass('loading');
			var self = this;
			this.model.save({},{
				success: function (model, response) {
					self.$el.removeClass('loading');
					localUser.attributes.votes.push(self.model.toJSON());
					self.voted_model.set('vote_count', self.voted_model.get('vote_count') + 1);
					self.render();
					localUser.attributes.profile.vote_count = localUser.get('profile').vote_count + 1;
				}
			});
		}
		/*
		}else {
			Datea.my_user_follows.remove(this.model);
			this.model.destroy();
			this.model = new Datea.Follow({
				object_type: this.model.get('object_type'),
				object_id: this.model.get('object_id'),
				follow_key: this.model.get('follow_key'),
			});
			this.followed_model.set('follow_count', this.followed_model.get('follow_count') - 1);
			this.render();
		}
		*/
	},
	
});
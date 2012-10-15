
var MapItemView = Backbone.View.extend({
	
	render: function() {
		
		var context = this.model.toJSON();
		// hydrate context 
		context.created = utils.formatDateFromISO(context.created, "dd/mm/yyyy - H:MM');
		context.content = context.content.replace(/\n/g, '<br />');
		context.full_url = utils.get_base_web_url() + this.model.get('url');
		if (this.model.get('position') && !this.model.get('position').coordinates) {
			context.position = false;
		}
		//context.tweet_text = this.model.get('extract');
		//context.hashtag = this.options.mappingModel.get('hashtag');
		this.$el.html( this.template(context));
		
		// get replies
		/*
		var responses = new Datea.MapItemResponseCollection();
		var self = this;
		responses.fetch({
			data: {map_items__in: this.model.get('id'), order_by:'created'},
			success: function (collection, response) {
				if (collection.length > 0) {
					var $replies = self.$el.find('.replies');
					_.each(collection.models, function(model){
						$replies.append(new Datea.MapItemResponseView({model: model}).render().el); 
					});
					$replies.show();
				}
			}
		})
		
		// comments
		this.comments = new Datea.CommentCollection();
		var self = this;
		this.comment_view = new Datea.CommentsView({
			el: this.$el.find('.comments'),
			model: this.comments,
			object_type: 'dateamapitem',
			object_id: this.model.get('id'),
			callback: function () {
				self.model.set({comment_count: (self.model.get('comment_count') + 1)});
			}
		})
		this.comments.fetch({
			data: {'object_type': 'dateamapitem', 'object_id': this.model.get('id'), order_by: 'created'} 
		});
		
		//***************
		// widgets
		var $widgets = this.$el.find('.datea-widgets');
		
		// FOLLOW WIDGET
		this.follow_widget = new Datea.FollowWidgetView({
			object_type: 'dateamapitem',
			object_id: this.model.get('id'),
			object_name: gettext('report'),
			followed_model: this.model,
			type: 'full',
			style: 'full-small', 
		});
		$widgets.append(this.follow_widget.render().el);
		
		
		// VOTE WIDGET
		this.vote_widget = new Datea.VoteWidgetView({
			object_type: 'dateamapitem',
			object_id: this.model.get('id'),
			object_name: gettext('report'),
			voted_model: this.model,
			style: 'full-small' 
		});
		$widgets.append(this.vote_widget.render().el);
		*/
		return this;
	},

	
});

var MapItemDetailView = Backbone.View.extend({
	
	className: 'map-item-view',
	
	
	render: function() {
		
		var context = this.model.toJSON();
		// hydrate context 
		context.created = utils.formatDateFromISO(context.created, "dd/mm/yyyy - H:MM");
		context.content = context.content.replace(/\n/g, '<br />');
		context.full_url = utils.get_base_web_url() + this.model.get('url');
		if (this.model.get('position') && !this.model.get('position').coordinates) {
			context.position = false;
		}
		//context.tweet_text = this.model.get('extract');
		//context.hashtag = this.options.mappingModel.get('hashtag');
		this.$el.html(this.template(context));
		
		// render replies, if any
		if (context.replies && context.replies.length > 0) {
			$reply_div = this.$el.find('.item-replies');
			var replyCollection = new MapItemResponseCollection(context.replies);
			replyCollection.each(function(model){
				$reply_div.append(new MapItemResponseView({model: model}).render().el); 
			});
		}
		
		// comments
		this.comments = new CommentCollection(context.comments);
		var self = this;
		this.comment_view = new CommentListView({
			el: this.$el.find('.item-comments'),
			collection: this.comments,
			object_type: 'dateamapitem',
			object_id: this.model.get('id'),
			callback: function () {
				self.model.set({comment_count: (self.model.get('comment_count') + 1)});
				self.options.parentView.scroll_refresh();
			}
		});
		this.comment_view.render();
		
		//***************
		// widgets
		
		var $widgets = this.$el.find('.widgets');
		
		/*
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
		*/
		
		// VOTE WIDGET
		this.vote_widget = new VoteWidgetView({
			object_type: 'dateamapitem',
			object_id: this.model.get('id'),
			object_name: 'dateo',
			voted_model: this.model,
			add_class: 'big-button' 
		});
		$widgets.append(this.vote_widget.render().el);
		
		// COMMENT WIDGET
		this.comment_widget = new CommentWidgetView({model:this.model, cluster_view: this.options.parentView});
		$widgets.append(this.comment_widget.render().el);
		
		return this;
	},

	
});
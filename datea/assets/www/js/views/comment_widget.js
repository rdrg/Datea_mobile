var CommentWidgetView = Backbone.View.extend({
	
	className: 'comment-widget',
	
	events: {
		'tap': 'focus_comment',
	},
	
	initialize: function() {
		this.model.bind('change', this.render, this);
		if (this.options.add_class) this.$el.addClass(this.options.add_class);
	},
	
	render: function() {
		var context = this.model.toJSON();
		context.label = 'comentar';
		this.$el.html(this.template(context));
		return this;
	},
	
	focus_comment: function (ev) {
		ev.preventDefault();
	  	if (this.options.cluster_view) {
	  		this.options.cluster_view.scroller.scrollToElement('.comment-form', 50);
	  		$('#comment-input', this.options.cluster_view.$el).focus();
	  	}
	}
	
});

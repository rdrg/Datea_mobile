var CommentWidgetView = Backbone.View.extend({
	
	className: 'comment-widget',
	
	events: {
		'click': 'scroll_bottom',
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
	
	scroll_bottom: function (ev) {
		ev.preventDefault();
		console.log('gabriel: implement scrollto bottom here ');
	}
	
});

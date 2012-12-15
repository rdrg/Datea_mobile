var CommentView = Backbone.View.extend({
	
	className: 'comment',
	
    render: function(){
        var context = this.model.toJSON();
        context.created = utils.formatDateFromISO(context.created, "dd/mm/yyyy - H:MM");
		context.comment = context.comment.replace(/\n/g, '<br />');
        this.$el.html(this.template(context));
        return this;
    }
});
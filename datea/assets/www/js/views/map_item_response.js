var MapItemResponseView = Backbone.View.extend({
	
	className: 'reply',
	
    render: function(){
        var context = this.model.toJSON();
        context.created = utils.formatDateFromISO(context.created, "dd/mm/yyyy - H:MM");
		context.content = context.content.replace(/\n/g, '<br />');
        this.$el.html(this.template(context));
        return this;
    }
});
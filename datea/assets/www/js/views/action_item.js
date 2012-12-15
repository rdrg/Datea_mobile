var ActionItemView = Backbone.View.extend({
	
	className: 'actions_action',
	
    render: function(){
        this.$el.html(this.template(this.model));
        return this;
    }
});

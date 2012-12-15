var ActionListView = Backbone.View.extend({
    render: function(){
        this.$el.html(ich.action_list_item_tpl(this.model.toJSON()));
        return this;
    }
});

var ActionDetailView = Backbone.View.extend({
    render: function(){
        this.$el.html(ich.action_detail_tpl(this.model.toJSON()));
        return this;
    }
});

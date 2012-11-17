var ActionItemView = Backbone.View.extend({
    render: function(){
        this.$el.html(this.template(this.model));
        return this;
    }
});

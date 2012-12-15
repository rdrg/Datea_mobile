window.ActionHeaderView = Backbone.View.extend({
    render: function () {
        //var userid = {'userid': id};        
        this.$el.html(this.template());
        return this;
    }
});

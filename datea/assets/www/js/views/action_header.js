window.ActionHeaderView = Backbone.View.extend({
    render: function (id) {
        var userid = {'userid': id};        
        this.$el.html(this.template(userid));
        return this;
    }
});

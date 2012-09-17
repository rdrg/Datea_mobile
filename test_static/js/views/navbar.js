var NavbarView = Backbone.View.extend({
    render:function(){
        this.$el.html(ich.navbar_tpl(this.model.toJSON()));
        return this;
    }
});

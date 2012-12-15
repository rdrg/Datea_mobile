var NavBarDateoView = Backbone.View.extend({
    
    render: function(context){
        this.$el.html(this.template(context));
        return this;
    }
});

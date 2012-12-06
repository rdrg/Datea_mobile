var NavBarDateoView = Backbone.View.extend({
    
    render: function(id){
        var mapid = {'mapid': id};
        this.$el.html(this.template(mapid));
        return this;
    }
});

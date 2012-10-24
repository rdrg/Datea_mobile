var NavBarDateoView = Backbone.View.extend({
    
    render: function(id){
        var mapid = {'mapid': id};
        console.log("action id from view render: " + mapid);
        this.$el.html(this.template(mapid));
        return this;
    }
});

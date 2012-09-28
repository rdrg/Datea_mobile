var MapItemMapView = Backbone.View.extend({
    
    render: function(){
        this.$el.html(this.template());
        return this;
    },
    
    loadMap: function() {
    	this.InfoLayer = 1;
    	console.log(this.collection); 
    },
    
});
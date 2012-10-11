var MappingMapView = Backbone.View.extend({
    
    initialize: function() {
    	
    },
    
    render: function(){
    	this.map_items = new MapItemCollection(this.model.get('map_items'))
        this.$el.html(this.template());
        return this;
    },
    
    loadMap: function() {
    	this.itemLayer = new Datea.olwidget.InfoLayer(
			this.model, this.map_items,
			{'name': 'Dateos', 'cluster': true}
		);
		
		// BUILD MAP OPTIONS
		var mapOptions = {
			"layers": ['google.streets', 'google.hybrid'],
			'defaultZoom': 12,
		}
		if (this.model.get('center') && this.model.get('center').coordinates) {
			mapOptions.defaultLon = this.model.get('center').coordinates[0];
			mapOptions.defaultLat =  this.model.get('center').coordinates[1];
		}
		if (this.model.get('boundary') && this.model.get('boundary').coordinates) {
			mapOptions.defaultBoundary = this.model.get('boundary');
		}
		
		this.map = new Datea.olwidget.Map("mapping-main-map", [this.itemLayer], mapOptions); 
    },
    
});
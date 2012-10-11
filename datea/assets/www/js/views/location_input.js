window.LocationInputView = Backbone.View.extend({
	
	initialize: function() {
		this.mapModel = this.options.mapModel;
		this.modelField = this.options.modelField;
	},
	
	render: function () {	
            this.$el.html(this.template());
            return this;
	},
	
	loadMap: function() {
    	
    	this.inputLayer = new Datea.olwidget.EditableLayer(
			this.model, 
			this.modelField, 
			{'name': 'Position'}, 
			this.options.mapCenter, 
			this.options.mapBoundary
		);
		
		// BUILD MAP OPTIONS
		var mapOptions = {
			'defaultZoom': 12,
		}
		if (this.mapModel.get('center') && this.mapModel.get('center').coordinates) {
			mapOptions.defaultLon = this.mapModel.get('center').coordinates[0];
			mapOptions.defaultLat =  this.mapModel.get('center').coordinates[1];
		}
		if (this.mapModel.get('boundary') && this.mapModel.get('boundary').coordinates) {
			mapOptions.defaultBoundary = this.mapModel.get('boundary');
		}
		
		this.map = new Datea.olwidget.Map("location-input-map", [this.inputLayer], mapOptions);
		this.inputLayer.setEditOn(); 
    },
	
	
	
});

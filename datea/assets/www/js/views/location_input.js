

function onLocTestSuccess(position) {
    $('.loc-data').html('Lat: '  + position.coords.latitude      + ', ' +
                        'Lng: ' + position.coords.longitude     + ', ' +
                        'Acc: '  + position.coords.accuracy      + ', ' +
                        'Head: '   + position.coords.heading       + ', '
						);
	window.DevLocation = {
		'lat': position.coords.latitude,
		'lng': position.coords.longitude,
	}
}

function onLocTestError(error) {
        $('.loc-data').html('error code: '    + error.code    + '<br />'  +
                			'error message: ' + error.message + '<br />' 
                		);
}

//document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	$('.loc-data').html("hola");
	var options = {
		maximumAge: 5000, 
		timeout: 50000, 
		enableHighAccuracy: true,
		}
	window.LocWatchId = navigator.geolocation.watchPosition(onLocTestSuccess, onLocTestError, options)
}


function locAccuracy2Zoom(acc, min, max) {
	
	var min = min || 12;
	var max = max || 18;
	var coef = max - min;
	
	if (typeof(acc) == 'undefined') {
		return min;
	}
	acc = (1 - (Math.sqrt(acc) / 350)) * coef;
	var zoom = parseInt(Math.round(acc + min));
	if (zoom < min) zoom = min;
	else if (zoom > max) zoom = max; 
	//alert(zoom);
	return zoom;
}



window.LocationInputView = Backbone.View.extend({
	
	initialize: function() {
		this.mapModel = this.options.mapModel;
		this.modelField = this.options.modelField;
	},
	
	events: {
		'click .show-current-location': 'show_current_location',
	},
	
	render: function () {	
            this.$el.html(this.template());
            return this;
	},
	
	loadMap : function() {
		var self = this;
		//document.addEventListener("deviceready", function() {
			navigator.geolocation.getCurrentPosition( 
				function (position) {
					if (typeof(position.coords.latitude) != 'undefined') {
						var zoom = locAccuracy2Zoom(position.coords.accuracy);
						var deviceLocInfo = {lat: position.coords.latitude, lng: position.coords.longitude, zoom: zoom};
						self.createMap(deviceLocInfo);
					}
				},
				function(error) {
					self.createMap();
				},
				{
					maximumAge: 5000, 
					timeout: 5000, 
					enableHighAccuracy: true,
				}
			);
		//}, false);
	},
	
	createMap: function(deviceLocInfo) {
    	
    	this.inputLayer = new Datea.olwidget.EditableLayer(
			this.model, 
			this.modelField, 
			{
				'name': 'Position'
			}, 
			this.options.mapCenter, 
			this.options.mapBoundary,
			deviceLocInfo
		);
		
		// BUILD MAP OPTIONS
		var mapOptions = {
			'defaultZoom': 12,
		}
		
		if (typeof(initCenter) != 'undefined') {
			mapOptions.defaultLon = deviceLocInfo.lng;
			mapOptions.defaultLat =  deviceLocInfo.lat;
			
		} else if (this.mapModel.get('center') && this.mapModel.get('center').coordinates) {
			mapOptions.defaultLon = this.mapModel.get('center').coordinates[0];
			mapOptions.defaultLat =  this.mapModel.get('center').coordinates[1];
		}
		if (this.mapModel.get('boundary') && this.mapModel.get('boundary').coordinates) {
			mapOptions.defaultBoundary = this.mapModel.get('boundary');
		}
		
		this.map = new Datea.olwidget.Map("location-input-map", [this.inputLayer], mapOptions);
		this.inputLayer.initCenter();
		this.inputLayer.setEditOn(); 
    },
    
    show_current_location: function (ev) {
    	ev.preventDefault();
    	var self = this;
    	navigator.geolocation.getCurrentPosition(
    		function (position) {
    			var zoom = locAccuracy2Zoom(position.coords.accuracy);
    			var LocInfo = {lat: position.coords.latitude, lng: position.coords.longitude, zoom: zoom};
    			self.inputLayer.initCenter(LocInfo);
    		},
    		function (error) {
    			console.log(error);
    		},
    		{
				maximumAge: 5000, 
				timeout: 5000, 
				enableHighAccuracy: true,
			}
    	);
    }
	
	
	
});

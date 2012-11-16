
/****
 * init with a showItemsCallback option: a function 
 * 	which is passed an MapItemCollection as argument 
 * (the mapitems in the touched item cluster on the map) 
 */
var MappingMapView = Backbone.View.extend({
    
    initialize: function() {
    	this.$el.css({height: main_h+"px", overflow: "hidden"});
    },
    
    events: {
		'click .show-current-location': 'show_current_location',
		'click .back-to-map': 'back_to_map',
		'click .zoom-to-item': 'zoom_to_item'
	},
	
	manual_scroll: true,
	
	events_active: true,
    
    render: function(){
      //this.eventAggregator.trigger("footer:hide");
      this.map_items = new MapItemCollection(this.model.get('map_items'));
      this.$el.html(this.template());
      this.$el.fadeIn("fast");
      return this;
    },
    
    loadMap : function() {
		var self = this;

		//document.addEventListener("deviceready", function() {
			navigator.geolocation.getCurrentPosition( 
				function (position) {
					if (typeof(position.coords.latitude) != 'undefined') {
						var zoom = locAccuracy2Zoom(position.coords.accuracy, 12, 16);
						var initCenter = {lat: position.coords.latitude, lng: position.coords.longitude, zoom: zoom};
						self.createMap(initCenter);
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
    	
		this.itemLayer = new Datea.olwidget.InfoLayer(
			this.model, this.map_items,
			{'name': 'Dateos', 'cluster': true},
			deviceLocInfo
		);
		
		// BUILD MAP OPTIONS
		var mapOptions = {
			"layers": ['google.streets', 'google.hybrid'],
			'defaultZoom': 12,
		}
		
		if (typeof(deviceLocInfo) != 'undefined') {
			mapOptions.defaultLon = deviceLocInfo.lng;
			mapOptions.defaultLat =  deviceLocInfo.lat;
			
		} else if (this.model.get('center') && this.model.get('center').coordinates) {
			mapOptions.defaultLon = this.model.get('center').coordinates[0];
			mapOptions.defaultLat =  this.model.get('center').coordinates[1];
		}
		if (this.model.get('boundary') && this.model.get('boundary').coordinates) {
			mapOptions.defaultBoundary = this.model.get('boundary');
		}
		
		this.map = new Datea.olwidget.Map("mapping-map", [this.itemLayer], mapOptions, this.show_cluster_content_callback, this);
		this.itemLayer.initCenter(); 
    },
    
    show_cluster_content_callback: function (itemCollection, self) {
    	if (!self.check_events_active()) return;
		//$('#mapping-map-view').fadeOut('fast');
    	self.item_cluster_view = new MapItemClusterView({collection: itemCollection, parent_view: self});
    	var $content = self.$el.find('.cluster-content-view');
    	$content.html(self.item_cluster_view.render().el);
    	$content.fadeIn('normal', function(){
    		self.events_active = true;
    		//self.item_cluster_view.scroll('cluster-content-view');
    	});
		window.backbutton_func = function() {
			self.back_to_map();
		}
    },
    
    back_to_map: function (ev) {
    	if (typeof(ev) != 'undefined') ev.preventDefault();
    	if (!this.check_events_active()) return;
    	this.item_cluster_view.close();
    	var self = this;
    	this.$el.find('.cluster-content-view').fadeOut("normal", function(){
    		self.events_active = true;
    	}) ;
    	/*
        $('#mapping-map-view').fadeIn('fast', function(){
        	self.events_active = true;
        });*/
        //this.map.updateSize();
    },
    
    zoom_to_item: function(arg) {
    	if (typeof(arg.attributes) != 'undefined'){
			var mdl = arg;
		}else{
			if (typeof(arg.currentTarget) != 'undefined') {
				arg.preventDefault();
				var id = $(arg.currentTarget).data('id');
			}else{
				var id = parseInt(arg);
			}
			var bone_id = this.map_items.url+id+'/';
	    	var mdl = this.map_items.get(bone_id)
		}
		if (!this.check_events_active()) return;
		
		//$('#mapping-map-view').fadeIn('fast');
		var pos = mdl.get('position').coordinates;
    	var locInfo = {lat: pos[1], lng: pos[0], zoom: 17};
    	this.itemLayer.initCenter(locInfo);
    	var self = this;
    	this.$el.find('.cluster-content-view').fadeOut('fast', function() {
    		self.item_cluster_view.close();
    		self.events_active = true;
    	}); 
    },
    
    show_current_location: function (ev) {
    	ev.preventDefault();
    	
    	if (!this.check_events_active()) return;
    	
    	var self = this;
    	navigator.geolocation.getCurrentPosition(
    		function (position) {
    			var zoom = locAccuracy2Zoom(position.coords.accuracy);
    			var LocInfo = {lat: position.coords.latitude, lng: position.coords.longitude, zoom: zoom};
    			self.itemLayer.initCenter(LocInfo);
    			self.events_active = true;
    		},
    		function (error) {
    			self.events_active = true;
    			console.log(error);
    		},
    		{
				maximumAge: 5000, 
				timeout: 5000, 
				enableHighAccuracy: true,
			}
    	);
    },
    
    check_events_active: function () {
    	if (this.item_cluster_view) {
    		if (!this.item_cluster_view.events_active) return false;
    	}
    	if (this.events_active) {
    		this.events_active = false;
    		return true;
    	} else {
    		return false;
    	} 
    }
});

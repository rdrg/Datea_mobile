
/****
 * init with a showItemsCallback option: a function 
 * 	which is passed an MapItemCollection as argument 
 * (the mapitems in the touched item cluster on the map) 
 */
var MappingMapView = Backbone.View.extend({
    
    initialize: function() {
    	//this.$el.css({height: main_h+"px", overflow: "hidden"});
    },
    
    events: {
		'tap .show-current-location': 'show_current_location',
		'tap .back-to-map': 'back_to_map',
		'tap .zoom-to-item': 'show_item_on_map'
	},
	
	events_active: true,
    
    render: function(){
      this.map_items = new MapItemCollection(this.model.get('map_items'));
      this.$el.html(this.template());
      this.$el.fadeIn("fast");
      return this;
    },
    
    loadMap : function(zoom_item_id) {
		var self = this;

		//document.addEventListener("deviceready", function() {
			navigator.geolocation.getCurrentPosition( 
				function (position) {
					if (typeof(position.coords.latitude) != 'undefined') {
						
						var zoom = locAccuracy2Zoom(position.coords.accuracy, 12, 16);
						var initCenter = {lat: position.coords.latitude, lng: position.coords.longitude, zoom: zoom};
						self.createMap(initCenter);
						if (typeof(zoom_item_id) != 'undefined') {
							self.zoom_to_item(zoom_item_id);
						}

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
		//this.itemLayer.initCenter(); 
    },
    
    show_cluster_content_callback: function (itemCollection, self) {
    	if (!self.check_events_active()) return;
    	self.item_cluster_view = new MapItemClusterView({collection: itemCollection, parent_view: self});
    	var $content = self.$el.find('.cluster-content-view');
    	$content.html(self.item_cluster_view.render().el);
    	$content.fadeIn('fast', function(){
    		self.events_active = true;
    	});
    	self.item_cluster_view.scroll('cluster-content-view');
		window.backbutton_func = function() {
			self.back_to_map();
		}
    },
    
   	manual_scroll: true,
	
	manual_scroll_refresh: function() {
		if (self.item_cluster_view) self.item_cluster_view.scroll_refresh();
	},
    
    back_to_map: function (ev) {
    	if (typeof(ev) != 'undefined') ev.preventDefault();
    	window.backbutton_func = undefined;
    	if (!this.check_events_active()) return;
    	var self = this;
    	this.$el.find('.cluster-content-view').fadeOut("fast", function(){
    		self.events_active = true;
    		self.item_cluster_view.close();
    		self.item_cluster_view = undefined;
    	}) ;
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
		
		//$('#mapping-map-view').fadeIn('fast');
		var pos = mdl.get('position').coordinates;
    	var locInfo = {lat: pos[1], lng: pos[0], zoom: 17};
    	this.itemLayer.initCenter(locInfo); 
    },
    
    show_item_on_map: function (arg) {
		if (!this.check_events_active()) return;
    	this.zoom_to_item(arg);
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
    			//console.log(error);
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

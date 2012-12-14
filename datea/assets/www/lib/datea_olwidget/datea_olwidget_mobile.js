(function() {


window.gettext = function(text) {
	return text;
}


var olwidget = {
    /*
     * Projection transformation
     */
    transformVector: function(vector, fromProj, toProj) {
        // Transform the projection of a feature vector or an array of feature
        // vectors (as used in a collection) between the given projections.
        if (fromProj.projCode == toProj.projCode) {
            return vector;
        }
        var transformed;
        if (vector.constructor == Array) {
            transformed = [];
            for (var i = 0; i < vector.length; i++) {
                transformed.push(this.transformVector(vector[i], fromProj, toProj));
            }
        } else {
            var cloned = vector.geometry.clone();
            transformed = new OpenLayers.Feature.Vector(cloned.transform(fromProj, toProj));
        }
        return transformed;
    },
    /*
     * Constructors for base (tile) layers.
     */
    osm: {
        map: function() {
            return new OpenLayers.Layer.OSM( "Simple OSM Map", { numZoomLevels: 19 });
        }
    },
    google: {
        map: function(type) {
            return this[type]();
        },
        streets: function() {
            return new OpenLayers.Layer.Google(gettext("Google Streets"),
                    {numZoomLevels: 20});
        },
        physical: function() {
            return this.terrain();
        },
        terrain: function() {
            return new OpenLayers.Layer.Google(gettext("Google Terrain"),
                    {type: google.maps.MapTypeId.TERRAIN});
        },
        satellite: function() {
            return new OpenLayers.Layer.Google(gettext("Google Satellite"),
                    {type: google.maps.MapTypeId.SATELLITE,
                        numZoomLevels: 22});
        },
        hybrid: function() {
            return new OpenLayers.Layer.Google(gettext("Google Hybrid"),
                    {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20});
        }
    },
    /*
     * Utilities
     */

    // Takes any number of objects as arguments.  Working through its arguments
    // from left to right, deep-copies all properties of each argument onto the
    // left-most object, from left to right (so properties on objects to the
    // right will override properties on objects to the left).  Returns the
    // left-most object.
    //
    // Useful for nested preferences, e.g.:
    //    deepJoinOptions({}, defaults, overrides, superoverrides);
    deepJoinOptions: function() {
        var destination = arguments[0];
        if (destination === undefined) {
            destination = {};
        }
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (source) {
                for (var a in source) {
                    if (source[a] !== undefined && source[a] !== null) {
                        if (typeof source[a] === 'object' && source[a].constructor != Array) {
                            destination[a] = this.deepJoinOptions(destination[a], source[a]);
                        } else {
                            destination[a] = source[a];
                        }
                    }
                }
            }
        }
        return destination;
    },
    isCollectionEmpty: function(geom) {
        /* Is the provided collection empty? */
        return !(geom && (geom.constructor != Array || geom[0] != undefined));
    },
    _customBaseLayers: {},
    registerCustomBaseLayers: function(layer_descriptions) {
        OpenLayers.Util.extend(this._customBaseLayers, layer_descriptions);
    }
};

olwidget.Map = OpenLayers.Class(OpenLayers.Map, {
    
    initialize: function(mapDivID, vectorLayers, options, showItemsCallback, mappingView) {
        this.vectorLayers = vectorLayers;
        this.opts = this.initOptions(options);
        this.initMap(mapDivID, this.opts);
        this.showItemsCallback = showItemsCallback;
        this.mappingView = mappingView;
    },
    /*
     * Extend the passed in options with defaults, and create unserialized
     * objects for serialized options (such as projections).
     */
    initOptions: function(options) {
        var defaults = {
            // Constructor options
            mapOptions: {
                projection: "EPSG:900913",
                displayProjection: "EPSG:4326",
                theme: null,
            },
            // Map div stuff
            
            mapDivClass: 'map-canvas',
            
            /*
            mapDivStyle: {
                width: '100%',
                height: '350px'
            },*/
            overlayStyle: {
				 	fillColor: '#ff0000',
				 	strokeColor: '#ff0000',
				 	pointRadius: 10,
			},
            layers: ['osm.map'],
            defaultLon: 0,
            defaultLat: 0,
            defaultZoom: 4,
            zoomToDataExtent: true,
            zoomToDataExtentMin: 17
        };

        // deep copy all options into "defaults".
        var opts = $.extend(true, defaults, options);

        // construct objects for serialized options
        /*
        var me = opts.mapOptions.maxExtent;
        opts.mapOptions.maxExtent = new OpenLayers.Bounds(me[0], me[1], me[2], me[3]);
        if (opts.mapOptions.restrictedExtent) {
            var re = opts.mapOptions.restrictedExtent;
            opts.mapOptions.restrictedExtent = new OpenLayers.Bounds(re[0], re[1], re[2], re[3]);
        }*/
       	opts.mapOptions.projection = new OpenLayers.Projection(opts.mapOptions.projection);
        opts.mapOptions.displayProjection = new OpenLayers.Projection(
            opts.mapOptions.displayProjection);

        opts.mapOptions.controls = [
        	new OpenLayers.Control.Attribution(),
        	new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            new OpenLayers.Control.Zoom(),
        ];
        return opts;
    },
    /*
     * Initialize the OpenLayers Map and add base layers
     */
    initMap: function(mapDivId, opts) {
        var mapDiv = document.getElementById(mapDivId);
        
        OpenLayers.Util.extend(mapDiv.style, opts.mapDivStyle);
        if (opts.mapDivClass) {
            mapDiv.className = opts.mapDivClass;
        }

        // Must have explicitly specified position for popups to work properly.
        if (!mapDiv.style.position) {
            //mapDiv.style.position = 'relative';
        }

        var layers = [new OpenLayers.Layer.OSM( "Simple OSM Map")];
        /*
        for (var i = 0; i < opts.layers.length; i++) {
            var parts = opts.layers[i].split(".");
            var map_service = olwidget[parts[0]];
            var map_type = parts[1];

            layers.push(map_service.map(map_type));
        }*/

        // Map super constructor
        OpenLayers.Map.prototype.initialize.apply(this, [mapDiv.id, opts.mapOptions]);

        if (this.vectorLayers) {
            for (var i = 0; i < this.vectorLayers.length; i++) {
                layers.push(this.vectorLayers[i]);
            }
        } else {
            this.vectorLayers 	= [];
        }
        if (layers.length > 0) {
            this.addLayers(layers);
            if (this.baseLayer) {
                // Only initCenter if we have base layers -- otherwise, user is
                // responsible for adding and then calling initCenter.
                this.initCenter();
            }
        }
        this.selectControl = new OpenLayers.Control.SelectFeature(
            this.vectorLayers);
        this.selectControl.events.on({
            featurehighlighted: this.featureHighlighted,
            featureunhighlighted: this.featureUnhighlighted,
            scope: this
        });
        // Allow dragging when over features.
        this.selectControl.handlers.feature.stopDown = false;
        this.events.on({
            zoomend: this.zoomEnd,
            scope: this
        });
        this.addControl(this.selectControl);
        this.selectControl.activate();
        //this.addControl(new olwidget.EditableLayerSwitcher());
    },
    initCenter: function() {
		
        if (this.opts.zoomToDataExtent) {
            var extent = new OpenLayers.Bounds();
            for (var i = 0; i < this.vectorLayers.length; i++) {
                var vl = this.vectorLayers[i];
                if (vl.opts.cluster) {
                    for (var j = 0; j < vl.features.length; j++) {
                        for (var k = 0; k < vl.features[j].cluster.length; k++) {
                            extent.extend(vl.features[j].cluster[k].geometry.getBounds());
                        }
                    }
                } else {
                    extent.extend(vl.getDataExtent());
                }
            }
            if (!extent.equals(new OpenLayers.Bounds())) {
                this.zoomToExtent(extent);
                this.zoomTo(Math.min(this.getZoom(), this.opts.zoomToDataExtentMin));
                return;
            }
        }
        // zoomToDataExtent == false, or there is no data on any layer
        var center = new OpenLayers.LonLat(
            this.opts.defaultLon, this.opts.defaultLat);
        center = center.transform(this.displayProjection, this.getProjectionObject());
        this.setCenter(center, this.opts.defaultZoom);
    },
    featureHighlighted: function(evt) {
    	this.openMapItems(evt);
        //this.createPopup(evt);
    },
    featureUnhighlighted: function(evt) {
        //this.deleteAllPopups();
    },
    zoomEnd: function(evt) {
        //this.deleteAllPopups();
    },
    
    /********************
     * pass cluster mapItem collection to showItemCollection callback
     */  
    openMapItems: function (evt) {
    	var feature = evt.feature;
    	this.selectedFeature = evt.feature;
    	var models = []; 
    	if (feature.cluster) {
    		for (var i = 0; i < feature.cluster.length; i++) {
    			var id = "/api/v1/map_item/"+feature.cluster[i].item_id+'/';
    			models.push(feature.layer.mapItems.get(id));
    		}
    	}else{
    		var id = "/api/v1/map_item/"+feature.item_id+'/';
    		models.push(feature.layer.mapItems.get(id));
    	}
    	if (this.showItemsCallback) this.showItemsCallback(new MapItemCollection(models), this.mappingView);
    	this.selectControl.unselect(this.selectedFeature);
    },
    
    clearSelected: function () {
    	if (typeof(this.selectedFeature) != 'undefined') {
    		this.selectControl.unselect(this.selectedFeature);
    		this.selectedFeature = undefined;
    	}
    },
    
    CLASS_NAME: "olwidget.Map"
});

olwidget.BaseVectorLayer = OpenLayers.Class(OpenLayers.Layer.Vector, {
    initialize: function(options) {
        if (!options) {
            options = {};
        }
        this.opts = options;
        this.defaultOpts = {};
        OpenLayers.Layer.Vector.prototype.initialize.apply(this);
    },
    setMap: function(map) {
        OpenLayers.Layer.Vector.prototype.setMap.apply(this, [map]);
        // If we are in an olwidget Map, inherit the olwidget Map's properties.
        if (map.CLASS_NAME == "olwidget.Map") {
            this.opts = olwidget.deepJoinOptions({
                    name: "data",
                    overlayStyle: {
                        fillColor: '#ff00ff',
                        strokeColor: '#ff00ff',
                        pointRadius: 6,
                        fillOpacity: 0.5,
                        strokeWidth: 2
                    },
                    selectOverlayStyle: {
                        fillColor: '#9999ff',
                        strokeColor: '#9999ff',
                        pointRadius: 6,
                        fillOpacity: 0.5,
                        strokeWidth: 2
                    }
                }, this.defaultOpts, map.opts, this.opts);
            this.name = this.opts.name;

            this.styleMap = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style(this.opts.overlayStyle,
                    {context: this.opts.overlayStyleContext}),
                "select": new OpenLayers.Style(this.opts.selectOverlayStyle,
                   {context: this.opts.overlayStyleContext}),
                "temporary": new OpenLayers.Style({display: "none"}),
            });
        }
    },
    
    initCenter: function (deviceLocInfo) {
    	
    	if (typeof(deviceLocInfo) != 'undefined') {
    		this.deviceCenter = new OpenLayers.LonLat( deviceLocInfo.lng, deviceLocInfo.lat);
        	this.deviceZoom = deviceLocInfo.zoom;
    	}
        
    	if (this.deviceCenter) {
    		
    		var lonlat = this.deviceCenter.transform(
			        		this.map.displayProjection,
			                this.map.getProjectionObject()
			              );
			var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
    		
    		if (this.boundaryPolygon && !this.boundaryPolygon.geometry.containsPoint(point)) {
    			this.map.zoomToExtent(this.boundaryPolygon.geometry.getBounds());
				this.map.zoomTo(Math.min(this.map.getZoom(), this.map.opts.zoomToDataExtentMin));
				return;	
    		}
    		this.map.panTo(lonlat);
		    this.map.zoomTo(this.deviceZoom);
    	
    	} else if (this.features.length > 0) {
			this.map.zoomToExtent(this.features[0].geometry.getBounds());
			this.map.zoomTo(Math.min(this.map.getZoom(), this.map.opts.zoomToDataExtentMin));
			
		}else if (this.boundaryPolygon){
			this.map.zoomToExtent(this.boundaryPolygon.geometry.getBounds());
			this.map.zoomTo(Math.min(this.map.getZoom(), this.map.opts.zoomToDataExtentMin));
		}else{
		    this.map.panTo(this.mapCenter.transform(
		        		this.map.displayProjection,
		                this.map.getProjectionObject()
		              ));
		    this.map.zoomTo(12);
		}
   },
   
   CLASS_NAME: "olwidget.BaseVectorLayer"
});


olwidget.calculateClusterSize = function (feature) {
	if (typeof(feature.attributes.count) == 'undefined') {
		return 12;
	}
	var n = feature.attributes.count;
	
    var pix;
    if (n == 1) {
        pix = 18;
    } else if (n <= 3) {
    	pix = 20;
    } else if (n <= 5) {
        pix = 22;
    } else if (n <= 10) {
    	pix = 24;
    } else if (n <= 25) {
        pix = 28;
    } else if (n <= 50) {
        pix = 30;
    } else {
        pix = 32;
    }
    return parseInt(pix * 2);
}


olwidget.InfoLayer = OpenLayers.Class(olwidget.BaseVectorLayer, {
    
    initialize: function(mappingModel, mapItems, options, deviceLocInfo) {
        olwidget.BaseVectorLayer.prototype.initialize.apply(this, [options]);
        this.mappingModel = mappingModel;
        this.mapItems = mapItems;
        
        if (this.mappingModel.get('item_categories').length > 0) {
	        this.categories = {};
	        var self = this;
	        _.each(this.mappingModel.get('item_categories'), function(cat){
	        	self.categories[cat.id] = cat;
	        });
	    }else{
	    	this.categories = false;
	    }
	    if (typeof(deviceLocInfo) != 'undefined') {
        	this.deviceCenter = new OpenLayers.LonLat( deviceLocInfo.lng, deviceLocInfo.lat);
        	this.deviceZoom = deviceLocInfo.zoom;
        }
    },
    
    setMap: function(map) {
        if (this.opts.cluster || map.opts.cluster) {
            // Use a different default style if we are clustering.
            var clusterStyle = {
                externalGraphic: "${external}",
                graphicWidth: "${getClusterWidth}",
                graphicHeight: "${getClusterHeight}",
                strokeWidth: 0,
                fillOpacity: "${getOpacity}",
                
                labelSelect: true,
                fontSize: "11px",
                fontFamily: "Helvetica, sans-serif",
                fontColor: "#ffffff"
            };
            this.defaultOpts.overlayStyle = olwidget.deepJoinOptions(
                {}, clusterStyle);
            this.defaultOpts.selectOverlayStyle = olwidget.deepJoinOptions(
                {}, clusterStyle);
            this.defaultOpts.overlayStyleContext = {
                width: function(feature) {
                	console.log('width');
                    return (feature.cluster) ? 2 : 1;
                },
                label: function(feature) {
                    if (feature.cluster && feature.cluster.length > 1) {
                        return feature.cluster.length;
                    }
                    return '';
                },
                color: function (feature) {
                	if (feature.cluster) {
                		if(feature.cluster.length == 1) {
	                		return feature.cluster[0].color;
	                	}else{
	                		return '#cccccc';
	                	}
                	}else{
	                	return feature.cluster[0].color;
                	}
                },
                external: function (feature) {
                	
                	if (feature.cluster && feature.cluster.length == 1){
                		if (!feature.cluster[0].marker_image) {
                			var size = parseInt(olwidget.calculateClusterSize(feature) / 2);
                			var color = feature.cluster[0].color.replace('#','');
                			return api_url+'/png/svgcircle?radius='+size+'&color='+color;
                		}else{
                			return api_url+feature.cluster[0].marker_image.image;
                		}
                	
                	}else{
                		var size = parseInt(olwidget.calculateClusterSize(feature) / 2);
                		var count_cat = {}
                		for (i in feature.cluster) {
                			var color = feature.cluster[i].color;
                			if (typeof(count_cat[color]) == 'undefined') {
                				count_cat[color] = 1;
                			}else{
                				count_cat[color]++;
                			}
                		}
                		var values = [];
                		var colors = [];
                		for (var color in count_cat) {
                			values.push(count_cat[color]);
                			colors.push(color.replace('#',''));
                		}
                		var url = api_url+'/png/piecluster?values='+values.join(',')+'&colors='+colors.join(',')+'&radius='+size;
                		return url;
                	}
                },
                
                getSize: function(feature) {
                	return olwidget.calculateClusterSize(feature);
                },
                
                getClusterWidth: function(feature) {
                	if (feature.cluster && feature.cluster.length == 1) {
                		if (!feature.cluster[0].marker_image) {
                			return olwidget.calculateClusterSize(feature);
                		}else{
                			return feature.cluster[0].marker_image.width;
                		}
                	}else if (feature.cluster){
                		return olwidget.calculateClusterSize(feature);
                	}else{
                		if (!feature.cluster[0].marker_image) {
                			return olwidget.calculateClusterSize(feature);
                		}else{
                			return feature.cluster[0].marker_image.width;
                		}
                	}
                },
                getClusterHeight: function (feature) {
                	if (feature.cluster && feature.cluster.length == 1) {
                		if (!feature.cluster[0].marker_image) {
                			return olwidget.calculateClusterSize(feature);
                		}else{
                			return feature.cluster[0].marker_image.height;
                		}
                	}else if (feature.cluster){
                		return olwidget.calculateClusterSize(feature);
                	}else{
                		if (!feature.cluster[0].marker_image) {
                			return olwidget.calculateClusterSize(feature);
                		}else{
                			return feature.cluster[0].marker_image.height;
                		}
                	}
                },
                getOpacity: function (feature) {
                	if (feature.cluster && feature.cluster.length > 1) {
                		return 1;
                	}else{
                		return 0.75;
                	}
                },
                
            };
        }
        // Merge our options with the map's.
        olwidget.BaseVectorLayer.prototype.setMap.apply(this, arguments);

        // Add cluster strategy if needed.
        if (this.opts.cluster === true) {
            if (!this.strategies) {
                this.strategies = [];
            }
            var cluster = new OpenLayers.Strategy.Cluster();
            cluster.distance = 55;
            cluster.setLayer(this);
            this.strategies.push(cluster);
            cluster.activate();
        }
    },
    
    afterAdd: function() {
        olwidget.BaseVectorLayer.prototype.afterAdd.apply(this);
        var gjson = new OpenLayers.Format.GeoJSON();
        var features = [];
        
        for (var i in this.mapItems.models) {
        	var map_item = this.mapItems.models[i];
        	
        	if (map_item.get('position')) {
        		
        		var feature = gjson.read(
        			JSON.stringify(map_item.get('position'))
        		, 'FeatureCollection');

	            feature = olwidget.transformVector(feature,
	                this.map.displayProjection, this.map.getProjectionObject());
	
	            if (feature.constructor != Array) {
	                feature = [feature];
	            }
	
	            for (var k = 0; k < feature.length; k++) {
                    feature[k].attributes = {};
                    feature[k].item_id = map_item.get('id');
                    if (map_item.get('category')) {
                    	var category = this.categories[map_item.get('category_id')];
                    	feature[k].color = category.color;
                    	if (category.marker_image) feature[k].marker_image = category.marker_image;
                    }else{
                    	feature[k].color = this.mappingModel.get('default_color');
                    	if (this.mappingModel.get('marker_image')) {
                    		feature[k].marker_image = this.mappingModel.get('marker_image');
                    	}
                    }
	                features.push(feature[k]);
	            }
            }
        }
        this.addFeatures(features);
    },
    
    reload: function () {
    	// strange debug -> ugly stuff
    	if (this.mapItems.collection) {
    		this.mapItems = this.mapItems.collection;
    	}
    	this.destroyFeatures();
    	this.afterAdd();
    },
	
	find_item_feature: function(item_id) {
		var found_feat = false;
		var page = 0;
		for (var level1 in this.features) {
			var feat = this.features[level1];
			if (feat.cluster) {
				for (var level2 in feat.cluster) {
					if (feat.cluster[level2].item_id == item_id) {
						found_feat = feat;
						page = parseInt(level2);
						break;
					}
				}
			}else{
				if (feat.item_id && feat.item_id == item_id) {
					found_feat = feat;
				}
			}
			if (found_feat != false) break;
		}
		return {feature: found_feat, page: page};
	},
    
    CLASS_NAME: "olwidget.InfoLayer"
});



olwidget.EditableLayer = OpenLayers.Class(olwidget.BaseVectorLayer, {

    initialize: function( model, modelField, options, centerData, boundaryData, deviceLocInfo) {
        olwidget.BaseVectorLayer.prototype.initialize.apply(this,
                                                            [options]);
        this.Model = model;
        this.ModelField = modelField;
        
        if (typeof(boundaryData) != "undefined") {
        	this.boundaryData = boundaryData;
        }
        if (typeof(centerData) != "undefined") {
        	this.mapCenter = new OpenLayers.LonLat( centerData.coordinates[0], centerData.coordinates[1]);
        }
        if (typeof(deviceLocInfo) != 'undefined') {
        	this.deviceCenter = new OpenLayers.LonLat( deviceLocInfo.lng, deviceLocInfo.lat);
        	this.deviceZoom = deviceLocInfo.zoom;
        }
        
    },
    setMap: function(map) {
        this.defaultOpts = {
            editable: true,
            geometry: 'point',
            isCollection: false
        };
        olwidget.BaseVectorLayer.prototype.setMap.apply(this, arguments);
        // force non-clustering, it doesn't make sense for editable maps.
        this.opts.cluster = false;
        this.drawControl = new OpenLayers.Control.DrawFeature(
            this, OpenLayers.Handler.Point, {});   
        this.readModel();
    },
    
    clearFeatures: function() {
        this.removeFeatures(this.features);
        this.destroyFeatures();
        this.Model[this.ModelField] = null;
    },
    
    readModel: function() {
        if (this.features) {
            this.removeFeatures(this.features);
        }
        if (this.Model.get(this.ModelField)) {
        	
        	var gjson = new OpenLayers.Format.GeoJSON();
        	var geom = gjson.read(
        		JSON.stringify(this.Model.get(this.ModelField))
        	, 'FeatureCollection');
            
            if (!olwidget.isCollectionEmpty(geom)) {
                geom = olwidget.transformVector(geom,
                    this.map.displayProjection,
                    this.map.getProjectionObject());
                if (geom.constructor == Array ||
                        geom.geometry.CLASS_NAME ===
                                "OpenLayers.Geometry.MultiLineString" ||
                        geom.geometry.CLASS_NAME ===
                                "OpenLayers.Geometry.MultiPoint" ||
                        geom.geometry.CLASS_NAME ===
                                "OpenLayers.Geometry.MultiPolygon") {
                    // extract geometries from MULTI<geom> types into
                    // individual components (keeps the vector layer flat)
                    if (geom.geometry != undefined) {
                        var geoms = [];
                        var n = geom.geometry.components.length;
                        for (var i = 0; i < n; i++) {
                            geoms.push(
                                new OpenLayers.Feature.Vector(
                                    geom.geometry.components[i])
                            );
                        }
                        this.addFeatures(geoms, {silent: true});
                    } else {
                        this.addFeatures(geom, {silent: true});
                    }
                } else {
                    this.addFeatures([geom], {silent: true});
                }
                this.numGeom = this.features.length;
            } else {
                this.numGeom = 0;
            }
        }
        // CREATE BOUNDARY LAYER IF NECESARY
        if (typeof(this.boundaryData) != 'undefined' && this.boundaryData != null) {

        	var gjson = new OpenLayers.Format.GeoJSON();
        	var collection = gjson.read(
        		JSON.stringify(this.boundaryData)
        	, 'FeatureCollection');
        	
        	this.boundaryPolygon = olwidget.transformVector(collection[0],
                    this.map.displayProjection,
                    this.map.getProjectionObject());
                    
            this.boundaryPolygon.style = {
            	'strokeWidth': 3,
    			'strokeOpacity': 1,
    			'strokeColor': '#ecff00',
    			'fillOpacity': 0,
            };
      
        	this.boundaryLayer = new OpenLayers.Layer.Vector("Boundary");
        	this.boundaryLayer.addFeatures(this.boundaryPolygon);
			this.map.addLayer(this.boundaryLayer);
        }
    },
    
    // Callback for openlayers "featureadded"
    addModel: function(event) {
    	
    	// check boundary (only on points for the moment)
    	if(!this.checkBoundary(event)) return;
    	
        // This function will sync the contents of the `vector` layer with the
        // Model GeoJSON field.
        if (this.opts.isCollection) {
            this.featureToModel(this.features);
        } else {
            // Make sure to remove any previously added features.
            if (this.features.length > 1) {
                var old_feats = [this.features[0]];
                this.removeFeatures(old_feats);
                this.destroyFeatures(old_feats);
            }
            this.featureToModel(event.feature);
        }
        
        // if adding point -> pan to point center
        if (this.opts.geometry == 'point'){
        	var center = new OpenLayers.LonLat( event.feature.geometry.x, event.feature.geometry.y);
        	this.map.panTo(center);
        }
    },
    
    // Callback for openlayers "featuremodified"
    modifyModel: function(event) {
    	
    	// check boundary (only on points for the moment)
    	if(!this.checkBoundary(event)) return;
    	
        if (this.opts.isCollection){
            // OpenLayers adds points around the modified feature that we want
            // to strip.  So only take the features up to "numGeom", the number
            // of features counted when we last added.
            var feat = [];
            for (var i = 0; i < Math.min(this.numGeom, this.features.length); i++) {
                feat.push(this.features[i].clone());
            }
            this.featureToTextarea(feat);
        } else {
            if (event.feature) {
                this.featureToModel(event.feature);
            } else {
				this.Model.set(this.ModelField, null, {silent: true});
            }
        }

        
        // if modifying point -> pan to point center
        if (this.opts.geometry == 'point'){
        	var center = new OpenLayers.LonLat( event.feature.geometry.x, event.feature.geometry.y);
        	this.map.panTo(center);
        }
        
    },
    
    featureToModel: function(feature) {
        if (this.opts.isCollection) {
            this.numGeom = feature.length;
        } else {
            this.numGeom = 1;
        }
        feature = olwidget.transformVector(feature,
                this.map.getProjectionObject(), this.map.displayProjection);
        if (this.opts.isCollection) {
            // Convert to multi-geometry types if we are a collection.  Passing
            // arrays to the WKT formatter results in a "GEOMETRYCOLLECTION"
            // type, but if we have only one geometry, we should use a
            // "MULTI<geometry>" type.
            if (this.opts.geometry.constructor != Array) {
                var geoms = [];
                for (var i = 0; i < feature.length; i++) {
                    geoms.push(feature[i].geometry);
                }
                var GeoClass = olwidget.multiGeometryClasses[this.opts.geometry];
                feature = new OpenLayers.Feature.Vector(new GeoClass(geoms));
            }
        }
        //this.textarea.value = olwidget.featureToEWKT(
        //    feature, this.map.displayProjection);
        var gjson = new OpenLayers.Format.GeoJSON();
    	this.Model.set(
    		this.ModelField, 
    		jQuery.parseJSON(gjson.write(feature.geometry)), 
    		{silent: true}
    	);
    },
    
    checkBoundary: function(event) {
    	
    	// remove alert popup
        if (typeof(this.alert_popup) != 'undefined') {
        	this.map.removePopup(this.alert_popup);
        	this.alert_popup.destroy();
        	delete this.alert_popup;
        }
    	
    	// only checkfor points at the moment
    	if (this.opts.geometry != 'point' || typeof(this.boundaryPolygon) == 'undefined') return true;
    		
		var point = new OpenLayers.Geometry.Point(event.feature.geometry.x, event.feature.geometry.y);
		if (!this.boundaryPolygon.geometry.containsPoint(point)){
			this.alert_popup = new OpenLayers.Popup.FramedCloud("Aviso",
                    	event.feature.geometry.getBounds().getCenterLonLat(),
                        null,
                        gettext('Fuera de la zona permitida!'),
                        null, false);
			this.map.addPopup(this.alert_popup);
			
			this.Model.set(this.ModelField, null, {silent: true});
			this.destroyFeatures();
			return false; 
		}
        return true;
    },
    
    cancel: function() {
        this.Model.set(this.ModelField, null, {silent: true});
		this.destroyFeatures();
    },
    
    refresh_from_model: function () {
    	this.destroyFeatures();
    	this.readModel();
    	this.initCenter();
    },
   
   setEditOn: function(){
   	   this.map.addControl(this.drawControl);
   	   this.drawControl.activate();
   	   this.events.on({
            "featuremodified": this.modifyModel,
            "featureadded": this.addModel,
            scope: this
        }); 
   },
    
    CLASS_NAME: "olwidget.EditableLayer"
});


if (typeof(window.Datea) == 'undefined') window.Datea = {};
window.Datea.olwidget = olwidget;
})();


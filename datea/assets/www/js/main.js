Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);
Backbone.View.prototype.eventAggregator.on("footer:hide", function(){
    $("#footer").fadeOut("fast");
});

var DateaRouter = Backbone.Router.extend({
     
	routes: {
	    "": "home",
        //temporary redirection to work on actions
        //"":"myActions",
        "login": "login",
        "logout": "logout",
        "about": "about",
        "user/:userid": "userLoadProfile",
        "user/edit/:userid": "userEditProfile",
        "actions": "actionList",
        "action/:actionid": "actionDetail",
        //"mapping/:mapid/reports":"mapItemList",
        "mapping/:mapid/report/create": "createReport",
        "mapping/:mapid/reports/map":"mappingMap",
        "mapping/:mapid/reports/:reportid":"mapItemDetail",
    	//"mapping/:mapid/reports/geoinput": "geoInput"
    	"history": "openHistory",
	},
	
	showView: function(selector, view) {
            //console.log("view name: " + view.constructor.toString());
	    if (this.currentView)
	        this.currentView.close();
	    $(selector).html(view.render().el);
	    this.currentView = view;
	    return view;
	},
	
	initialize: function () {
	    $.ajaxSetup({ 
            beforeSend: function(){
                $('#spinner').fadeIn("fast");
            },
            complete: function(){
                $('#spinner').fadeOut("fast");
                
                setTimeout(function () {
                    myScroll.refresh();
                }, 0);
            },
            crossDomain:true 
        });
	    $.support.cors = true;

             /*
	    this.bind('all', function(trigger, args){
                var path = trigger.split(':');
                console.log("route path: " + path[0]);
            });	        
            */
        if(localSession.get('logged')){
            this.headerView = new LoggedInHeaderView();
		  $('#header').html(this.headerView.render().el);
	    }else{
            this.headerView = new LoggedOutHeaderView();
            $('#header').html(this.headerView.render().el);
        }
        //$('.header').html(this.headerView.render().el);
        this.navBar = new NavBar({});
        this.navBarView = new NavBarView({model: this.navBar});
        $('#footer').html(this.navBarView.render().el);
  
	    //this.footerView = new FooterView();
	    //$('.footer').html(this.footerView.render().el);
	},

	home: function() {
        //console.log("enter home"); 
        if (localSession.get('logged')) {
            var userid = localSession.get('userid');
            
            //localUser.fetch({ data: { 'id': userid }});   
            
            dateaApp.navigate("/actions", {trigger: true});
            /*
            if (!this.actionCollection) {
                this.actionCollection = new ActionCollection();
                this.actionCollection.url = api_url + '/api/v1/action/';
            }
        
            var self = this;
            //console.log("action url: " + this.actionCollection.url);
            this.actionCollection.fetch({
                success: function(collection, response){
                    console.log("actions fetched");
                    if(!self.actionsView){
                        self.actionsView = new ActionsView({model:self.actionCollection});
                    }
                    self.showView('#content', self.actionsView);
                    //load navigation
                }
            });
            */
            //this.showView("#content", this.actionView);
        } else {
            if(!this.homeView) {
                this.homeView = new HomeView();
            }
            
            this.showView('#content', this.homeView);
        }
	},
	
	about: function () {
		if (!this.aboutView) {
        	    this.aboutView = new AboutView();
		}
		$('#content').html(this.aboutView.render().el);
                    this.headerView.selectMenuItem('about-menu');
	},
	
	login: function () {
		if (!this.session) {
		    this.session = new Session();
		}
		
		if (!this.loginView) {
			this.loginView = new LoginView({ model: this.session });
		}

		this.showView('#content', this.loginView);
	},
	
	logout: function () {
		var logout_data = {
		    "username": null,
            "token" : null,
            "userid": null,
            "logged": false
        };
		
	    localSession.set(logout_data);
	    console.log(localSession.get('logged'));
	    localStorage.setItem("authdata", JSON.stringify(logout_data));
	    dateaApp.navigate("/", { trigger: true });
	},
	
	userLoadProfile: function (userid) {
        localUser.fetch({ data: { 'id': userid }});
        this.profileView = new ProfileView({ model: localUser });
        this.showView('#content', this.profileView);
	},
	
	userEditProfile: function (userid) {
		this.profileEditView = new ProfileEditView({ model: localUser });
        this.showView('#content', this.profileEditView);
	},
	
	myActions: function () {
        this.actionCollection = new ActionCollection();
        this.actionCollection.url = api_url + '/api/v1/action/search/';
        var self = this;
        //console.log("action url: " + this.actionCollection.url);
        this.actionCollection.fetch({
            success: function(collection, response){
                //console.log("actions fetched");
                self.actionsView = new ActionsView({model:self.actionCollection});
                self.showView('#content', self.actionsView);
            }
        });
	},
    
    actionList: function(){

    	if (!this.actionListView) {
        	this.actionListView = new ActionsView({
        		user_model: localUser
    	 	});
        }
        
    	this.showView('#content', this.actionListView);
    	this.actionListView.fetch_models();
    },

    actionDetail: function(actionid){
        if(!this.actionModel){
            this.actionModel = new Action();
        }
        this.actionModel.url = api_url + "/api/v1/mapping_full/" + actionid+'/';
        var self = this;
        this.actionModel.fetch({
            success: function(){
                //console.log("action fetched");
                if(!this.actionView){
                    self.actionView = new ActionView({model: self.actionModel});
                }
                self.showView('#content', self.actionView);
            }
        });
    },

    mappingDetail: function(mapid){
        //console.log("show map item");
        
        if(!this.mapItems){
            this.mapItems = new MapItemCollection();
        }
        
        if(!this.mapItemListView){
            this.mapItemListView = new MapItemListView({model: this.mapItems}); 
        }

        var self = this;
        this.mapItems.fetch({
            data: {'id': mapid},
            success: function(){
                self.showView('#content', self.mapItemListView());
            }
        });
    },
         
	createReport: function(mapid) {
        
        var do_fetch = true;
        
        if (!this.actionModel) {
    		this.actionModel = new Action({id: mapid});
    		this.actionModel.urlRoot = '/api/v1/mapping_full';
    	}else if (this.actionModel.get('id') == mapid) {
    		do_fetch = false;
    	}
		
		if (do_fetch) {
    		var self = this;
	        this.actionModel.fetch({
	            success: function(mdl, response){
	                this.mdl = mdl;
	                var other = this;
	                self.newMapItem = new MapItem({
	                    action: other.mdl.get('resource_uri')
	                });
	                self.newMapItemView = new CreateMapItemView({
	                    model: self.newMapItem,
	                    mappingModel: self.actionModel
	                }); 
	                self.showView('#content', self.newMapItemView);   
	                /*
	                setTimeout(function(){
	                    window.myScroll.refresh();
	                }, 0);
	                */
	            }
	        });
	    }else{
	    	this.newMapItem = new MapItem({
                action: this.actionModel.get('resource_uri')
            });
            this.newMapItemView = new CreateMapItemView({
                model: this.newMapItem,
                mappingModel: this.actionModel
            }); 
            this.showView('#content', this.newMapItemView); 
	    }
    },
       
	mappingMap: function(mapid, callback_func) {
		
		//mapid = 16;
    	
    	var do_fetch = true;
    	
    	if (!this.actionModel) {
    		this.actionModel = new Action({id: mapid});
    		this.actionModel.urlRoot = '/api/v1/mapping_full';
    	}else if (this.actionModel.get('id') == mapid) {
    		do_fetch = false;
    	}
        
        if (!this.mappingMapView) {
        	this.mappingMapView = new MappingMapView({
        		model: this.actionModel
       	 	});
       	}
    	
    	if (do_fetch) {
    		var self = this;
    		this.actionModel.fetch({
    			success: function () {
					self.showView('#content', self.mappingMapView);
					self.mappingMapView.loadMap();
					if (typeof(callback_func) != 'undefined') callback_func();
				},
				error: function(error) {
					console.log("fetch error");
				}
			});
		}else{
			this.showView('#content', this.mappingMapView);
			this.mappingMapView.loadMap();
			if (typeof(callback_func) != 'undefined') callback_func();
		}
    },
    
    mapItemDetail: function(mapping_id, item_id) {

    	var self = this;
    	this.mappingMap( mapping_id, function(){
    		// find model data in actionModel map items
    		var item_data = _.find(self.actionModel.get('map_items'), function(item){
    			return item.id == item_id;
    		});
    		var item_model =  new MapItem(item_data);
    		var clusterCol = new MapItemCollection([item_model]);
    		if (item_model.get('position') && item_model.get('position').coordinates) {
    			//self.mappingMapView.zoom_to_item(item_model);
    			var pos = item_model.get('position').coordinates;
			    var locInfo = {lat: pos[1], lng: pos[0], zoom: 17};
			    if (self.mappingMapView.itemLayer) {
			    	self.mappingMapView.itemLayer.initCenter(locInfo);
			    }
    		}
    		self.mappingMapView.show_cluster_content_callback(clusterCol, self.mappingMapView);
    	});
    },
    
    geoInput: function(mapid) {
    	
    	//mapid = 16;
    	
    	var do_fetch = true;
    	
    	if (!this.actionModel) {
    		this.actionModel = new Action({id: mapid});
    		this.actionModel.urlRoot = '/api/v1/mapping_full';
    	}else if (this.actionModel.get('id') == mapid) {
    		do_fetch = false;
    	}
    	
    	if (!this.mappingMapView) {
        	this.locationInputView = new LocationInputView({
        		mapModel: this.actionModel,
        		model: new MapItem(),
        		modelField: 'position',
       	 	});
       	}
    	
    	if (do_fetch) {
    		var self = this;
    		this.actionModel.fetch({
    			success: function () {
					self.showView('#content', self.locationInputView);
					self.locationInputView.loadMap();
				},
				error: function(error) {
					console.log("fetch error");
				}
			});
		}else{
			this.showView('#content', this.locationInputView);
			this.locationInputView.loadMap();
		}    	
    },
    
    openHistory: function () {    	
    	if (!this.historyListView) {
        	this.historyListView = new HistoryListView({
        		user_model: localUser,
       	 	});
        }
        
    	this.showView('#content', this.historyListView);
    	this.historyListView.fetch_models(); 
    }
});


$(document).ready(function () {
    utils.loadTpl(['HeaderView', 
                    'AboutView', 
                    'LoginView', 
                    'ProfileView',
                    'ProfileEditView',
                    'NavBarView', 
                    'HomeView', 
                    'ActionsView',
                    'ActionView',
                    'FooterView', 
                    'LoggedInHeaderView', 
                    'LoggedOutHeaderView', 
                    'MapItemListView',
                    'CreateMapItemView',
                    'CreateMapItemOneTwo',
                    //'CreateMapItemOne',
                    'CreateMapItemTwo',
                    'CreateMapItemThree',
                    'CreateMapItemFour',
                    'MappingMapView',
                    'LocationInputView',
                    'MapItemDetailView',
                    'MapItemClusterView', 
                    'ImageOverlayView',
                    'CommentView',
                    'CommentListView',
                    'MapItemResponseView',
                    'FollowActionWidgetView',
                    'VoteWidgetView',
                    'CommentWidgetView',
                    'HistoryItemView',
                    'HistoryListView'
                    ],
	function () {
	        Backbone.Tastypie.prependDomain = api_url || "http://10.0.2.2:8000";
	        
	        window.localSession = new localSession();
	        window.localUser = new User();
	
	        if(window.localStorage.getItem('authdata') != null) {
	            var authdata = JSON.parse(localStorage.getItem('authdata'));
	            localSession.set(authdata);
                    //bootstrap user data
                    if(localSession.get('logged')){
                        userid = localSession.get('userid');
                        console.log('token: ' + localSession.get('token'));
                        localUser.fetch({ 
                            data: {
                            	'username': localSession.get('username'),
                            	'api_key': localSession.get('token'),
                                'id': userid, 
                                'user_full': 1 
                            },
                            success: function(mdl, res){
                                //console.log("model: " + JSON.stringify(mdl.toJSON()));
                                if(mdl.get('follows') !== undefined ){
                                        window.myFollows = new FollowCollection(mdl.get('follows'));
                                        //console.log('follows: ' + JSON.stringify(myFollows));
                                }
                                if(mdl.get('votes') !== undefined){
                                    window.myVotes = new VoteCollection(mdl.get('votes'));
                                }
                            },
                            error: function(){
                                console.log("some error fetching");
                            }
                        });        
                    }
	        }
	        window.dateaApp = new DateaRouter();           
	        Backbone.history.start();
    });
});


function onLoad() {
	document.addEventListener("deviceready",onDeviceReady,false);


    // Initializing BackStack.StackNavigator for the #container div
    /*
    window.stackNavigator = new BackStack.StackNavigator({
        el: '#main'
    });
    */
    
    // Pushing FirstView on to the stack
    //window.stackNavigator.pushView(ActionsView);*/
}

function onDeviceReady() {
	document.addEventListener("menubutton", onMenuDown, false);
    document.addEventListener("offline", onOffline, false);

    //scroll
    function loaded() {
        window.myScroll = new iScroll('main',{
            hScroll : false,
            fixedScrollbar: false,
            hideScrollbar: true,
        });
    }
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    window.addEventListener('load', setTimeout(function () { loaded(); }, 200), false);
}

function onMenuDown() {
	$('#footer').toggle();
}

function onOffline(){
    navigator.notification.alert(
        'Datea necesita estar conectado a Internet',
        offLineAlertDismissed,
        'Sin Conexion',
        'ok'
    );
}

function offLineAlertDismissed() {
    if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
    } else if (navigator.device && navigator.device.exitApp) {
        navigator.device.exitApp();
    }
}


window.myScroll = {
	refresh: function() {console.log('fake refresh myscroll')}
};

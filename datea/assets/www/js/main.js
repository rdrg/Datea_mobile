Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    if (this.scroller) this.scroller.destroy();
    if (this.map) this.map.destroy();
    this.remove();
    this.unbind();
};

Backbone.View.prototype.kill_event = function (ev) {
	ev.preventDefault();
	ev.stopImmediatePropagation();
}


var DateaRouter = Backbone.Router.extend({
     
    routes: {
	    "": "home",
        "login": "login",
        "logout": "logout",
        "register": "register",
        "about": "about",
        "search":"searchForm",
        "search/:term/:cat/:order": "searchQuery",
        "user": "userLoadProfile",
        "user/edit": "userEditProfile",
        "actions": "actionList",
        "action/:actionid": "actionDetail",
        "mapping/:mapid/report/create": "createReport",
        "mapping/:mapid/reports/map":"mappingMap",
        "mapping/:mapid/reports/:reportid":"mapItemDetail",
        "mapeo/:mapid/dateos/:reportid":"mapItemDetail",
    	"history": "openHistory",
	},
	
	initialize: function () {
		/* INIT MAIN CATEGORIES */
		this.categoryCollection = new CategoryCollection();
		this.categoryCollection.fetch();
	},
	
	route: function (route, name, callback) {
		return Backbone.Router.prototype.route.call(this, route, name, function() {
            this.last_route = Backbone.history.fragment;
            callback.apply(this, arguments);
        });
	},
	
	last_actions_route: 'actions',
	
	/******************** VIEW FUNCTIONS *****************************/
	
    showView: function(selector, view) {
        //console.log("view name: " + view.constructor.toString());
        if (this.currentView) this.currentView.close();
	    $(selector).html(view.render().el);
	    this.currentView = view;
	    
 	    if (!view.manual_scroll) {
 	    	setTimeout( function() {
 	    		view.scroll();
 	    	}, 0);
        }
	    return view;
	},    
    
    /******************** ROUTE FUNCTIONS **************************/

    home: function() {
    	//console.log("enter home"); 
        if (localSession.get('logged')) {
            //this.renderNavigation('general');
            var userid = localSession.get('userid');            
            dateaApp.navigate("/actions", {trigger: true});
        } 
        else {
            if(!this.homeView) {
                this.homeView = new HomeView();
            }else{
            	this.homeView.delegateEvents();
            }
            this.showView('#main', this.homeView);
            this.renderHeader('loggedout');
            this.renderNavigation('loggedout'); 
        }
    },
	
    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
	    }
	    $('#main').html(this.aboutView.render().el);
            this.headerView.selectMenuItem('about-menu');
    },
	
    login: function () {
        this.loginView = new LoginView({model: localSession});
		this.showView('#main', this.loginView);
        this.renderNavigation('back');
        this.renderHeader('general');
	},
	
	register: function() {
        this.registerView = new RegisterView({model: localSession});
        this.showView("#main", this.registerView);
        this.renderHeader('general');
        this.renderNavigation('back');
	},
	
	logout: function () {
	    var logout_data = {
	        "username": null,
                "token" : null,
                "userid": null,
                "logged": false
            };
		
	    localSession.set(logout_data);
	    //console.log(localSession.get('logged'));
	    localStorage.setItem("authdata", JSON.stringify(logout_data));
	    window.localUser = new User();
	    dateaApp.navigate("/", { trigger: true });
	},
	
	userLoadProfile: function () {
        this.profileView = new ProfileView({ model: localUser });
        this.showView('#main', this.profileView);
        if (this.profileView.postRender){
            this.profileView.postRender();
        }
        this.renderNavigation('general', 'ftr_profile');
        this.renderHeader('general');
    },
	
	userEditProfile: function () {
        this.profileEditView = new ProfileEditView({ model: localUser });
        this.showView('#main', this.profileEditView);
    	this.renderNavigation('general', 'ftr_profile');
        this.renderHeader('general');
	},
	    
    actionList: function(){
        //console.log("normal action list");
        this.last_actions_route = 'actions';
        
        if(!this.actionCollection){
            this.actionCollection = new ActionCollection();
        }
        //console.log("userid: " + localUser.get("id"));
    	if (!this.actionListView) {
        	this.actionListView = new ActionsView({
                model: this.actionCollection,
        		user_model: localUser,
                selected_mode : 'my_actions',
                router: this                        
    	 	});
        }else{
        	if (this.current_action_mode && this.current_action_mode != 'my_actions') {
        		this.actionListView.page = 0;
        	}
        	this.actionListView.selected_mode = 'my_actions';
        	this.actionListView.delegateEvents();
        	$.extend(this.actionListView.options, {
        		search_term: '-',
        		category_filter: '-',
        		order_by: '-',
        	});
        }
        this.actionListView.params_to_default();
        
    	this.showView('#main', this.actionListView);
    	this.actionListView.search_models();
        this.renderHeader('actions', 'my_actions');
        this.renderNavigation('general', 'ftr_actions');
        //$('#ftr_actions').addClass('menu_on');  
    },

    actionDetail: function(actionid){
    	
        if(!this.actionModel){
            this.actionModel = new Action();
        }
        this.actionModel.url = api_url + "/api/v1/mapping/" + actionid + '/';
        var self = this;
        
        window.backbutton_func = function() {
        	self.navigate('actions', {trigger: true, replace: true});
        }
        
        if (this.actionModel.get('id') == actionid) {
        	
        	if(!this.actionView){
                this.actionView = new ActionView({model: self.actionModel, router: this});
            }else{
	            this.actionView.delegateEvents();
	        }
            this.showView('#main', self.actionView);
            this.renderNavigation('dateo', 'none', self.actionModel.toJSON());
            this.renderHeader('general');
            self.setBackNavFromActionDetail();
             
        }else{
	        this.actionModel.fetch({
	            success: function(model, response){
	                //console.log("action fetched");
	                if(!self.actionView){
	                    self.actionView = new ActionView({model: self.actionModel, router: self});
	                }else{
	                	self.actionView.delegateEvents();
	                }
	                self.showView('#main', self.actionView);
	                self.renderNavigation('dateo', 'none', self.actionModel.toJSON());
	                self.renderHeader('general');
	                self.setBackNavFromActionDetail();  
	            },
	            error: function(error){
	            	self.navigate(self.last_route, {trigger: false, replace: true});
	                onOffline();
	            }
	        });
	    }
    },
         
	createReport: function(mapid) {
        
        var do_fetch = true;
        
        if (!this.actionModel) {
    		this.actionModel = new Action({id: mapid});
    		this.actionModel.urlRoot = '/api/v1/mapping';
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
	                self.showView('#main', self.newMapItemView);
	                self.renderNavigation('dateo', 'ftr_new-dateo', self.actionModel.toJSON());
	                self.renderHeader('general');
	                self.setBackNavTo('action/'+mapid);   
	            },
	            error: function(error){
	            	self.navigate(self.last_route, {trigger: false, replace: true});
	                onOffline();
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
            this.showView('#main', this.newMapItemView); 
            this.renderNavigation('dateo', 'ftr_new-dateo', this.actionModel.toJSON());
            this.renderHeader('general');
            this.setBackNavTo('action/'+mapid);  
	    }
    	this.renderHeader('general');
    },
       
	mappingMap: function(mapid, callback_func, zoom_item_id) {
		
		var self = this;
    	var fetch_map_items = true;
    	var fetch_complete = false;
    	
    	
    	if (!this.actionModel || this.actionModel.get('id') != mapid) {
    		fetch_complete = true;
    	} else if (this.actionModel.get('id') == mapid && this.actionModel.get('map_items')) {
    		fetch_map_item = false;
    	}
    	
    	if(!this.actionModel){
            this.actionModel = new Action();
        }

        if (!this.mappingMapView) {
        	this.mappingMapView = new MappingMapView({
        		model: this.actionModel
       	 	});
       	 	var delegate = false;
       	}else{
       		var delegate = true;
       	}
       	
       	var show_view_func = function (delegate) {
			self.showView('#main', self.mappingMapView);
			if (delegate) self.mappingMapView.delegateEvents(); 
			self.mappingMapView.loadMap(zoom_item_id);
			if (typeof(callback_func) != 'undefined') callback_func();
			self.renderNavigation('dateo', 'ftr_dateo', self.actionModel.toJSON());
			self.renderHeader('general');
			self.setBackNavTo('action/'+mapid); 
       	};
       	
       	var error_func = function () {
       		self.navigate(self.last_route, {trigger: false, replace: true});
	        onOffline();
       	};
       	
       	if (fetch_complete) {
        	this.actionModel.url = api_url + "/api/v1/mapping/" + mapid + '/';
        	this.actionModel.fetch({
        		success: function() {
        			self.mapItems = new MapItemCollection();
	        		self.mapItems.fetch({
		    			data: {
		    				published: 1,
		    				action: mapid,
		    				order_by: '-created',
		    			},
		    			success: function () {
		    				self.actionModel.set('map_items', self.mapItems.toJSON(), {silent: true});
			        		show_view_func(delegate);
						},
						error: function () { error_func(); }
					});
	        	},
	        	error: function () { error_func(); } 
        	});
    	
    	} else if (fetch_map_items) {
    		this.mapItems = new MapItemCollection();
    		this.mapItems.fetch({
    			data: {
    				published: 1,
    				action: mapid,
    				order_by: '-created',
    			},
    			success: function () {
    				self.actionModel.set('map_items', self.mapItems.toJSON(), {silent: true});
	        		show_view_func(delegate);
				},
				error: function() { error_func(); }
			});
			
		}else{
			show_view_func(delegate);
		}
	    this.renderHeader('general');
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
    		self.mappingMapView.show_cluster_content_callback(clusterCol, self.mappingMapView);
    	}, item_id);
    },
    
    openHistory: function () {
    	
    	this.last_action_route = 'history';
    	    	
    	if (!this.historyListView) {
        	this.historyListView = new HistoryListView({
        		user_model: localUser,
       	 	});
        }
        
    	this.showView('#main', this.historyListView);
    	this.historyListView.fetch_models();
        this.renderNavigation('general', 'ftr_history');
        this.renderHeader('general');
    },

    searchForm: function(){
        var self = this;
        if(!this.categoryCollection){
            this.categoryCollection = new CategoryCollection();
        }

        if(!this.searchFormView){
            this.searchFormView = new SearchFormView({
                model: this.categoryCollection
            });
        }
        if (this.categoryCollection.size() == 0) {
	        this.categoryCollection.fetch({
	            success: function(){
	                self.showView("#main", self.searchFormView );
	            },
	            error: function(error){
	            	self.navigate(self.last_route, {trigger: false, replace: true});
	                onOffline();
	            }
	        });
	    }else{
	    	self.showView("#main", self.searchFormView );
	    }
        this.renderNavigation('general');
        this.renderHeader('actions', 'nav_srch');
        this.action_reset = true;
    },

    searchQuery : function(term, cat, order){
          
        this.last_actions_route = this.last_route;
          
        if(!this.actionCollection){
            this.actionCollection = new ActionCollection();
        }
    	if (!this.actionListView) {
        	this.actionListView = new ActionsView({
                model: this.actionCollection,
				user_model: localUser,
                selected_mode : 'all_actions',
                search_term: term,
                category_filter: cat,
                order_by: order,
                router: this                  
    	 	});
        }else{
            if (this.action_reset || (this.current_action_mode && this.current_action_mode != 'all_actions')) {
            	this.actionListView.page = 0;
            	this.action_reset = undefined;
            }
            this.actionListView.selected_mode = 'all_actions';
            $.extend(this.actionListView.options, {
        		search_term: term,
        		category_filter: cat,
        		order_by: order,
        	});
			this.actionListView.delegateEvents();
        }
    	this.showView('#main', this.actionListView);
    	this.actionListView.search_models();
       	this.renderNavigation('general', 'ftr_actions');
       	this.renderHeader('actions');
    },
    
    
    /***********************  NAVIGATION AND HEADER FUNCTIONS ***********************/

    renderNavigation: function(mode, highlight, context){
    	
        switch(mode){
            case 'general':
                this.navBarView = new NavBarView();
                $('#footer').html(this.navBarView.render().el);
                break;
            case 'dateo':
                this.navBarView = new NavBarDateoView();
                $('#footer').html(this.navBarView.render(context).el);
                break;
            case 'loggedout':
                this.navBarView = new NavBarWelcomeView();
                $('#footer').html(this.navBarView.render().el);
                break;
            case 'back':
            	this.navBarView = new NavBarBackView();
                $('#footer').html(this.navBarView.render().el);
                break;
            case 'none':
            	$('#footer').empty();
            	break;
            default:
                this.navBarView = new NavBarView();
            	$('#footer').html(this.navBarView.render().el);
                break;
        }
        

        if(highlight !== undefined){
            $("#footer div").each(function(index, elem){
                if(this.id == highlight){
                   $(this).addClass('menu_on');
                }else{
                    $(this).removeClass('menu_on');
                }
            });   
        }else{
             $("#footer div").each(function(index, elem){
                $(this).removeClass('menu_on');
            });   
        }
    },
 
    renderHeader: function(mode, highlight){ 
    	
    	// don't render the header every time
    	if (this.header_mode && this.header_mode == mode) {
    		if (this.header_highlight && typeof(highlight) != 'undefined' && this.header_highlight == highlight) {
    			return;
    		}else if (!this.header_highlight && typeof(highlight) == 'undefined') {
    			return;
    		}
    	}
    	this.header_mode = mode;
    	if (typeof(highlight) != 'undefined') {
    		this.header_highlight = highlight;
    	}else{
    		this.header_highlight = undefined;
    	}
    	
        switch(mode){
            case 'general':
                this.headerView = new LoggedInHeaderView();
                $('#header').html(this.headerView.render().el);
                break;
            case 'actions':
                this.headerView = new ActionHeaderView();
                $('#header').html(this.headerView.render().el);
                break;
            case 'loggedout':
                this.headerView = new LoggedOutHeaderView();
                $('#header').html(this.headerView.render().el);
                break;
            case 'first':
                this.headerView = new FirstHeaderView();
                $('#header').html(this.headerView.render().el);
                break;
            default:
                this.headerView = new LoggedInHeaderView();
            	$('#header').html(this.headerView.render().el);

        }
        
        if(highlight !== undefined){
            $("#header li").each(function(index, elem){
                //console.log("attribute: " + this.id);
                if(this.id == highlight){
                   $(this).addClass('header_on');
                }else{
                    $(this).removeClass('header_on');
                }
            });   
        }else{
             $("#header li").each(function(index, elem){
                $(this).removeClass('header_on');
            });   

        }
    },
    
    setBackNavTo: function (url, options) {
    	if (typeof(options) == 'undefined') {
    		var options = {
    			trigger: true,
    			replace: true,
    		}
    	}
    	var self = this;
    	window.backbutton_func = function () {
    		self.navigate(url, options);
    	}
    },
    
    setBackNavFromActionDetail: function (options) {
    	if (typeof(options) == 'undefined') {
    		var options = {
    			trigger: true,
    			replace: true,
    		}
    	}
    	var self = this;
    	window.backbutton_func = function () {
    		console.log(self.last_actions_route)
    		self.navigate(self.last_actions_route, options);
    	}
    }
     
});

	
function init_main () {
	
	window_h = $(window).height();
	main_h = (window_h - 48);
	main_w = $(window).width();
	//$('#main').css({height: "432px", width: "320px"});
	$('#main').css({height: main_h, width: main_w});
	
    utils.loadTpl(['HeaderView', 
                    'AboutView', 
                    'LoginView',
                    'RegisterView',
                    'RegisterSuccessView',
                    'ProfileView',
                    'ProfileEditView',
                    'NavBarView',
                    'NavBarDateoView', 
                    'NavBarWelcomeView',
                    'NavBarBackView',
                    'HomeView', 
                    'ActionsView',
                    'ActionView',
                    'ActionItemView',
                    'LoggedInHeaderView', 
                    'LoggedOutHeaderView',
                    'ActionHeaderView',
                    'FirstHeaderView', 
                    'MapItemListView',
                    'CreateMapItemView',
                    'CreateMapItemOne',
                    'CreateMapItemThree',
                    'CreateMapItemFour',
                    'MappingMapView',
                    'LocationInputView',
                    'MapItemDetailView',
                    'MapItemClusterView', 
                    'SelectImageOverlayView',
                    'CommentView',
                    'CommentListView',
                    'MapItemResponseView',
                    'FollowActionWidgetView',
                    'VoteWidgetView',
                    'CommentWidgetView',
                    'HistoryItemView',
                    'HistoryListView',
                    'SearchFormView',
                    'CustomSelectBoxView',
                    'CustomSelectBoxOptionsView'
                    ],
	function () {
		
		init_autosize();
		init_links();		
		
		/******************* INIT AJAX *******************/
		$.ajaxSetup({ 
            beforeSend: function(){
                $('#spinner').fadeIn("fast");
            },
            complete: function(){
                $('#spinner').fadeOut("fast");
            },
            crossDomain:true 
        });
		$.support.cors = true;
		
        Backbone.Tastypie.prependDomain = api_url;
        
        /******************* INIT USER ***********************/       
        window.localSession = new Session();
        window.localUser = new User();

        if(localStorage.getItem('authdata') && localStorage.getItem('authdata')!== null) {
               
            var authdata = JSON.parse(localStorage.getItem('authdata'));
            localSession.set(authdata);
            //bootstrap user data
            
            if(localSession.get('logged')){
                userid = localSession.get('userid');
                //console.log('token: ' + localSession.get('token'));
                //console.log("fetching user data");
                
                fetch_data = { 
                    data:{
                    	'id': userid,
                    	'api_key': localSession.get('token'),
                    	'username': localSession.get('username'),
                    	'user_full': 1
                    },
                    success: function(mdl, res){
                    	//console.log(mdl);
                        //console.log("user model: " + JSON.stringify(mdl.toJSON()));
                        if(mdl.get('follows') !== undefined ){
                                window.myFollows = new FollowCollection(mdl.get('follows'));
                                //console.log('follows: ' + JSON.stringify(myFollows));
                        }
                        if(mdl.get('votes') !== undefined){
                            window.myVotes = new VoteCollection(mdl.get('votes'));
                        }
                        window.dateaApp = new DateaRouter();           
                    	Backbone.history.start();

                    },
                    error: function(){
                        //console.log("some error fetching");
                        onOffline();
                        //window.dateaApp = new DateaRouter();           
                    	//Backbone.history.start();
                    	setTimeout(function(){
                    		localUser.fetch(fetch_data);
                    	},1500);
          
                    }
                }
                
                localUser.fetch(fetch_data);
            
            }else{
                //console.log("localstorage but not logged in");    
            	window.dateaApp = new DateaRouter();           
            	Backbone.history.start();
            }
        }else{
            //console.log("no data in localSotrage, storing persistent session data");    
            window.localStorage.setItem('authdata', JSON.stringify(localSession));
        	window.dateaApp = new DateaRouter();           
       		Backbone.history.start();
        }
    });  
}

/************************* INIT EVENTS ****************************/

function onLoad() {
	document.addEventListener("deviceready",onDeviceReady,false);
	init_main();
}

function onDeviceReady() {
	document.addEventListener("menubutton", onMenuDown, false);
    //document.addEventListener("offline", onOffline, false);
    document.addEventListener("backbutton", onBackKeyPress, false);
    document.addEventListener("hidekeyboard", onKBHide, false);
    document.addEventListener("showkeyboard", onKBShow, false);
}



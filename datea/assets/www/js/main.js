Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};


var DateaRouter = Backbone.Router.extend({
     
    routes: {
	    "": "home",
        "login": "login",
        "logout": "logout",
        "register": "register",
        "about": "about",
        "search":"searchForm",
        "search/:term/:cat/:order": "searchQuery",
        "user/:userid": "userLoadProfile",
        "user/edit/:userid": "userEditProfile",
        "actions": "actionList",
        "action/:actionid": "actionDetail",
        "mapping/:mapid/report/create": "createReport",
        "mapping/:mapid/reports/map":"mappingMap",
        "mapping/:mapid/reports/:reportid":"mapItemDetail",
        "mapeo/:mapid/dateos/:reportid":"mapItemDetail",
    	"history": "openHistory",
	},
	
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
        this.renderNavigation('none');
        this.renderHeader('general');
	},
	
	register: function() {
        this.registerView = new RegisterView({model: localSession});
        this.showView("#main", this.registerView);
        this.renderHeader('general');
        this.renderNavigation('none');
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
	
	userLoadProfile: function (userid) {
        this.profileView = new ProfileView({ model: localUser });
        this.showView('#main', this.profileView);
        if (this.profileView.postRender){
            this.profileView.postRender();
        }
        this.renderNavigation('general', 'ftr_profile');
        this.renderHeader('general');
    },
	
	userEditProfile: function (userid) {
        this.profileEditView = new ProfileEditView({ model: localUser });
        this.showView('#main', this.profileEditView);
    	this.renderNavigation('general', 'ftr_profile');
        this.renderHeader('general');
	},
	    
    actionList: function(){
        //console.log("normal action list");
        if(!this.actionCollection){
            this.actionCollection = new ActionCollection();
        }
        //console.log("userid: " + localUser.get("id"));
    	if (!this.actionListView) {
        	this.actionListView = new ActionsView({
                model: this.actionCollection,
        		user_model: localUser,
                selected_mode : 'my_actions'                        
    	 	});
        }else{
        	this.actionListView.selected_mode = 'my_actions';
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
        this.actionModel.url = api_url + "/api/v1/mapping_full/" + actionid + '/';
        var self = this;
        this.actionModel.fetch({
            success: function(){
                //console.log("action fetched");
                if(!this.actionView){
                    self.actionView = new ActionView({model: self.actionModel});
                }
                self.showView('#main', self.actionView);
                self.renderNavigation('general');
            },
            error: function(error){
                onOffline();
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
	                self.showView('#main', self.newMapItemView);   
	            },
	            error: function(error){
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
	    }
   		this.renderNavigation('dateo', 'ftr_new-dateo',mapid);
    	this.renderHeader('general');
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
					self.showView('#main', self.mappingMapView);
					self.mappingMapView.loadMap();
					if (typeof(callback_func) != 'undefined') callback_func();
				},
				error: function(error) {
	                onOffline();
				}
			});
		}else{
			this.showView('#main', this.mappingMapView);

			this.mappingMapView.loadMap();
			if (typeof(callback_func) != 'undefined') callback_func();
		}
	    this.renderNavigation('dateo', 'ftr_dateo', mapid);
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
        this.renderNavigation('dateo', 'ftr_dateo', mapping_id);
        this.renderHeader('general');
    },
    
    openHistory: function () {    	
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
        this.categoryCollection.fetch({
            success: function(){
                self.showView("#main", self.searchFormView );
            },
            error: function(error){
                onOffline();
            }
        })
        this.renderNavigation('general');
        this.renderHeader('actions', 'nav_srch');
    },

    searchQuery : function(term, cat, order){
          
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
                order_by: order                    
    	 	});
        }else{
            this.actionListView.selected_mode = 'all_actions';
            this.actionListView.page = 0;
            $.extend(this.actionListView.options, {
        		search_term: term,
        		category_filter: cat,
        		order_by: order,
        	});
        }
    	this.showView('#main', this.actionListView);
    	this.actionListView.search_models();
       	this.renderNavigation('general', 'ftr_actions');
       	this.renderHeader('actions', 'nav_srch');
    },
    
    
    /***********************  NAVIGATION AND HEADER FUNCTIONS ***********************/

    renderNavigation: function(mode, highlight, action_id){
        switch(mode){
            case 'general':
                this.navBarView = new NavBarView();
                $('#footer').html(this.navBarView.render().el);
                break;
            case 'dateo':
                this.navBarView = new NavBarDateoView();
                $('#footer').html(this.navBarView.render(action_id).el);
                break;
            case 'loggedout':
                this.navBarView = new NavBarWelcomeView();
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
        
    }   
});


$(document).ready(function(){ init_main(); });

	
function init_main () {
	
	main_h = ($(window).height() - 48);
	main_w = $(window).width();
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
                    'HomeView', 
                    'ActionsView',
                    'ActionView',
                    'ActionItemView',
                    'FooterView', 
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
                    'SearchFormView'
                    ],
	function () {
		
		init_autosize();
		
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
        window.localSession = new Session();
        window.localUser = new User();
            //
            
        //if(localStorage.getItem('authdata') !== null) {
        if(localStorage.getItem('authdata') && localStorage.getItem('authdata')!== null) {
            //console.log(localStorage.getItem('authdata'));
    	    //window.localSession = new localSession();
            //window.localUser = new User();
               
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
                        	},1000);
              
                        }
                    }
                    
                    localUser.fetch(fetch_data);        
                }
                else{
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


function onLoad() {
	document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady() {
	document.addEventListener("menubutton", onMenuDown, false);
    //document.addEventListener("offline", onOffline, false);
    document.addEventListener("backbutton", onBackKeyPress, false);
    document.addEventListener("hidekeyboard", onKBHide, false);
    document.addEventListener("showkeyboard", onKBShow, false);
}

function onKBHide() {
	if (footer_was_visible) showFooter('show');
}

function onKBShow() {
	footer_was_visible = footer_visible;
	showFooter('hide');
}

footer_visible = true;
footer_was_visible = true;
function onMenuDown() {
	showFooter('toggle');
}

function showFooter(mode) {
	
	switch(mode) {
		case 'show':
			footer_visible = true;
			$('#footer').slideDown('fast', function(){
				$(body).addClass('with-footer');
			});
			break;
		case 'hide':
			$(body).removeClass('with-footer');
			footer_visible = false;
			$('#footer').hide();
			break;
		case 'toggle':
			if (footer_visible) {
				showFooter('hide');
			}else{
				showFooter('show');
			}
			break;
	}
}

function init_autosize() {
	$(document).on('focus', 'textarea',{},function(){
		if (!$(this).hasClass('autosized')) {
			$(this).addClass('autosized').autosize();
		}
	});
}


function onBackKeyPress() {
	if (typeof(window.backbutton_func) != 'undefined') {
		window.backbutton_func();
		window.backbutton_func = undefined;
	}else{
		window.history.back();
	}
}

function onOffline(close){
	var error = 'Datea necesita Internet. Revisa tu conexión e intenta nuevamente.';
	if (navigator.notification){
	    navigator.notification.alert(
	        error,
	        function() 
	        {
	        	if (typeof(close) != 'undefined' && close == true) {
	        		if (navigator.app && navigator.app.exitApp) {
				        navigator.app.exitApp();
				    } else if (navigator.device && navigator.device.exitApp) {
				        navigator.device.exitApp();
				    }
	        	}
	        },
	        'Error de conexión',
	        'ok'
	    );
	 }else{
	 	alert(error);
	 }
	 $('#spinner').fadeOut("fast");
}

function offLineAlertDismissed() {
	// he quitado esto, porque no creo que deberia salirse de la app, sino simplemente avisar.
}


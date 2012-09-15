window.api_url = "http://192.168.2.113:8000";

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
                //temporary redirection to work on actions
               // "":"allActions",
        "login": "login",
		"logout": "logout",
		"about": "about",
		"user/:userid": "userLoadProfile",
        "user/edit/:userid": "userEditProfile",
        "actions": "myActions",
        "action/:actionid": "actionDetail",
        "mapping/:mapid": "loadMapping",
        "mapping/:mapid/edit": "editMapping",
        "mapping/:mapid/admin": "adminMapping"
	},
	
	showView: function(selector, view) {
	    if (this.currentView)
	        this.currentView.close();
	    
	    $(selector).html(view.render().el);
	    this.currentView = view;
	    return view;
	},
	
	initialize: function () {
		$.ajaxSetup({ crossDomain:true });
		$.support.cors = true;
		
		this.headerView = new HeaderView();
		$('.header').html(this.headerView.render().el);
	},

	home: function() {
        if (localSession.get('logged')) {
            var userid = localSession.get('userid');
            localUser.fetch({ data: { 'id': userid }});   
           
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
                    self.showView('#app', self.actionsView);
                    //load navigation
                }
            });
            //this.profileView = new ProfileView({ model: localUser });
            
            this.showView("#app", this.actionView);
        } else {
            if(!this.homeView) {
                this.homeView = new HomeView();
            }
            
            this.showView('#app', this.homeView);
        }
	},
	
	about: function () {
		if (!this.aboutView) {
			this.aboutView = new AboutView();
		}
		$('#app').html(this.aboutView.render().el);
		this.headerView.selectMenuItem('about-menu');
	},
	
	login: function () {
        console.log("load login");
		if (!this.session) {
			this.session = new Session();
		}
		
		if (!this.loginView) {
			this.loginView = new LoginView({ model: this.session });
		}
		//clean window
	        $('#home_msg').remove();
		$('.header').removeAttr('id');

		this.showView('#app', this.loginView);
	    $('.header').html(this.headerView.render().el);
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
        this.showView('#app', this.profileView);
	},
	
	userEditProfile: function (userid) {
		this.profileEditView = new ProfileEditView({ model: localUser });
        this.showView('#app', this.profileEditView);
	},
	
	myActions: function () {
            this.actionCollection = new ActionCollection();
            this.actionCollection.url = api_url + '/api/v1/action/';
            var self = this;
            console.log("action url: " + this.actionCollection.url);
            this.actionCollection.fetch({
                success: function(collection, response){
                    console.log("actions fetched");
                    self.actionsView = new ActionsView({model:self.actionCollection});
                    self.showView('#app', self.actionsView);
                    //load navigation
                }
            });
	},

        actionDetail: function(actionid){
            if(!this.actionModel){
                this.actionModel = new Action();
            }
            this.actionModel.url = api_url + "/api/v1/mapping/" + actionid;
            var self = this;

            this.actionModel.fetch({
                success: function(){
                    console.log("action fetched");
                    if(!this.actionView){
                        self.actionView = new ActionView({model: self.actionModel});
                    }
                    self.showView('#app', self.actionView);
                    //load navigation
                }
            });
        },
	
	createDateo: function () {
		this.dateo = null;
	}
});

$(document).ready(function () {
    utils.loadTpl(['HeaderView', 'AboutView', 'LoginView', 'ProfileView',
                   'ProfileEditView', 'HomeView', 'ActionsView','ActionView'], function () {

            Backbone.Tastypie.prependDomain = api_url || "http://10.0.2.2:8000";
            
            window.localSession = new localSession();
            window.localUser = new User();

            if(localStorage.getItem('authdata') !== undefined) {
                var authdata = JSON.parse(localStorage.getItem('authdata'));
                localSession.set(authdata);
            }

            window.dateaApp = new DateaRouter();           
            Backbone.history.start();
    });
});

function onLoad() {
	document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady() {
	document.addEventListener("menubutton", onMenuDown, false);
}

function onMenuDown() {
	$('#footer').toggle();
}

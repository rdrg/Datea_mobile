var api_url = "http://10.0.2.2:8000";

var DateaRouter = Backbone.Router.extend({
     
	routes: {
		"": "home",
		"login": "login",
		"logout": "logout",
		"about": "about",
		"user/:userid": "userLoadProfile",
        "user/edit/:userid": "userEditProfile",
        "actions": "allActions",
        "dateo/new": "createDateo"
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
           
            if (!this.profileView) {
            	this.profileView = new ProfileView({ model: localUser });
            }
            
            $("#app").html(this.profileView.render().el);
        } else {
        	if(!this.homeView) {
        		this.homeView = new HomeView();
            }
        	$('#app').html(this.homeView.render().el);
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
        console.log("load login");
		if (!this.session) {
			this.session = new Session();
		}
		
		if (!this.loginView) {
			this.loginView = new LoginView({ model: this.session });
			//this.loginView.render();
		}
		//clean window
		$('#home_msg').remove();
		$('.header').removeAttr('id');

		$('#content').html(this.loginView.render().el);
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
	    localStorage.setItem("authdata", JSON.stringify(logout_data));
	    dateaApp.navigate("/", { trigger: true });
	},
	
	userLoadProfile: function (userid) {
        localUser.fetch({ data: { 'id': userid }});
        this.profileView = new ProfileView({ model: localUser });
        $("#content").html(this.profileView.render().el);
	},
	
	userEditProfile: function (userid) {
		this.profileEditView = new ProfileEditView({ model: localUser });
        $("#content").html(this.profileEditView.render().el);
	},
	
	allActions: function () {
		alert('entro a allActions');
		this.actionCollection = new ActionCollection();
		this.actionModel = new Action();
		var self = this;
        	
		this.actionCollection.fetch({
        	success: function(c, res) {
        		alert('intento el fetch')
        		$("#content").html(new ActionsView({ model: self.actionCollection }).render().el);
            }
        }); 
	},
	
	createDateo: function () {
		this.dateo = null;
	}
});

$(document).ready(function () {
    utils.loadTpl(['HeaderView', 'AboutView', 'LoginView', 'ProfileView',
                   'ProfileEditView', 'HomeView', 'ActionsView'], function () {

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

function onLoad(){
	document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady(){
	document.addEventListener("menubutton", onMenuDown, false);
}

function onMenuDown(){
	$('#footer').toggle();
}

var api_url = "http://192.168.2.113:8000";

var DateaRouter = Backbone.Router.extend({
	routes: {
		"": "home",
		"login": "login",
		"about": "about",
		"user/:userid": "userLoadProfile",
        "user/edit/:userid": "userEditProfile",
        "actions": "allActions"
	},
	
	initialize: function () {
		$.ajaxSetup({ crossDomain:true });
		$.support.cors = true;
		
		this.headerView = new HeaderView();
		$('.header').html(this.headerView.render().el);
	},

	home: function(){
		if(!this.homeView){
			this.homeView = new HomeView();
		}
		$('body').html(this.homeView.render().el);
	},
	
	about: function () {
		if (!this.aboutView) {
			this.aboutView = new AboutView();
		}
		$('#app').html(this.aboutView.render().el);
		this.headerView.selectMenuItem('about-menu');
	},
	
	login: function () {
		if (!this.session) {
			this.session = new Session();
		}
		
		if (!this.loginView) {
			this.loginView = new LoginView({ model: this.session });
			this.loginView.render();
		}
		$('#app').html(this.loginView.render().el);
		this.headerView.selectMenuItem('login-menu');
	},
	
	userLoadProfile: function (userid) {
		localUser.fetch({ data: { 'id': userid }});
        this.profileView = new ProfileView({ model: localUser });
        $("#app").html(this.profileView.render().el);
	},
	
	userEditProfile: function (userid) {
		this.profileEditView = new ProfileEditView({ model: localUser });
        $("#app").html(this.profileEditView.render().el);
	},
	
	allActions: function () {
		alert('entro a allActions')
		this.actionCollection = new ActionCollection();
        var self = this;
        this.actionCollection.fetch({
            success: function(collection, response) {
                $("#app").html(new ActionsView({ model: self.actionCollection }).render().el);
            }
        }); 
	}
});

utils.loadTpl(['HeaderView', 'AboutView', 'LoginView', 'ProfileView',
               'ProfileEditView', 'HomeView', 'ActionsView'], function () {

	Backbone.Tastypie.prependDomain = api_url || "http://10.0.2.2:8000";
	
	window.localSession = new localSession();
	console.log(window.localSession);
    window.localUser = new User();
	
	var app = window.app = new DateaRouter();
	
	Backbone.history.start();
});

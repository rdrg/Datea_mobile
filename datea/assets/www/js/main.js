var api_url = "http://192.168.2.113:8000";

var DateaRouter = Backbone.Router.extend({
	routes: {
		"": "login",
		"about": "about",
		"user/:userid": "userLoadProfile",
        "user/edit/:userid":"userEditProfile"
	},
	
	initialize: function () {
		$.ajaxSetup({ crossDomain:true });
		$.support.cors = true;
		
		this.headerView = new HeaderView();
		$('.header').html(this.headerView.render().el);
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
	}
});

utils.loadTpl(['HeaderView', 'AboutView', 'LoginView', 'ProfileView',
               'ProfileEditView'], function () {
	Backbone.Tastypie.prependDomain = api_url || "http://10.0.2.2:8000";
	
	window.localSession = new localSession();
    window.localUser = new User();
	
	var app = window.app = new DateaRouter();
	
	Backbone.history.start();
});

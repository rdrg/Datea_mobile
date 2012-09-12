var api_url = "http://10.0.2.2:8000";

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
		
                if(local_session.get('logged')){
                    this.headerView = new HeaderView();
                    $('.header').html(this.headerView.render().el);
                    var userid = local_session.get('userid');
                    localUser.fetch({ data: { 'id': userid }});
                    this.profileView = new ProfileView({ model: localUser });
                    $("#app").html(this.profileView.render().el);

                }else{
                    if(!this.homeView){
                        this.homeView = new HomeView();
                    }
                $('#app').html(this.homeView.render().el);

                }
	},

	home: function(){
		if(!this.homeView){
			this.homeView = new HomeView();
		}
		$('#app').html(this.homeView.render().el);
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
			//this.loginView.render();
		}
		$('#app').html(this.loginView.render().el);
		//this.headerView.selectMenuItem('login-menu');
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
		alert('entro a allActions');
		this.actionCollection = new ActionCollection();
                var self = this;
                this.actionCollection.fetch({
                success: function(collection, response) {
                $("#app").html(new ActionsView({ model: self.actionCollection }).render().el);
            }
        }); 
	}
});

$(document).ready(function(){
    utils.loadTpl(['HeaderView', 'AboutView', 'LoginView', 'ProfileView',
                   'ProfileEditView', 'HomeView', 'ActionsView'], function () {

            Backbone.Tastypie.prependDomain = api_url || "http://10.0.2.2:8000";
            
            window.local_session = new localSession();
            //console.log(localSession);

            window.localUser = new User();

            if(localStorage.getItem('authdata') !== undefined){
                var authdata = JSON.parse(localStorage.getItem('authdata'));
                local_session.set(authdata);
            }
            console.log("init router");
            window.dateaApp = new DateaRouter();           
            Backbone.history.start();
    });
});

///////ROUTER//////////
var api_url = "http://192.168.2.129:8000";

var AppRouter = Backbone.Router.extend({
    
    initialize: function(){
        ich.grabTemplates();
        $.ajaxSetup({
            crossDomain:true
            //accepts: "application/json",
            //dataType: "json"
        });
        //console.log("seting up ajax");
        Backbone.Tastypie.prependDomain = api_url;
        $.support.cors = true;
    },
    routes: {
        "":"home",
        "login":"login",
        "register": "register",
        "user/:userid": "loadProfile",
        "user/edit/:userid":"editProfile"
    },
    home: function(){
        this.homeView = new HomeView();
        $("#app").html(this.homeView.render().el);
    },
    login: function(){
        this.session = new Session();
        this.loginView = new LoginView({model: this.session});
        $("#app").html(this.loginView.render().el);
    },
    register: function(){
        this.session = new Session();
        this.registerView = new RegisterView({model: this.session});
        $("#app").html(this.egisterView.render().el);
    },
    loadProfile: function(userid){
        this.userModel = new User({id:userid});
        this.userModel.fetch();
        this.profileView = new ProfileView({model:this.userModel});
        $("#app").html(this.profileView.render().el);
    },

    editProfile: function(userid){
        var authdata = JSON.parse(localStorage.getItem("authdata"));
        var uname = authdata.username;
        var token = authdata.token;
        this.userModel = new User({id:userid});
        this.userModel.fetch();
        this.profileEditView = new ProfileEditView({model:this.userModel});
        $("#app").html(this.profileEditView.render().el);
    }
});

//var app = new AppRouter();
//Backbone.history.start();

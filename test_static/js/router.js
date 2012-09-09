///////ROUTER//////////
//var api_url = "http://localhost:8000";

var AppRouter = Backbone.Router.extend({
    
    initialize: function(){
        ich.grabTemplates();
        //ich.grabExternalTemplates();
        $.ajaxSetup({
            crossDomain:true
            //accepts: "application/json",
            //dataType: "json"
        
        });
        $.support.cors = true;
        
    },
    routes: {
        "":"home",
        "back": "back",
        "login":"login",
        "logout": "logout",
        "register": "register",
        "history": "history",
        "user/:userid": "loadProfile",
        "user/edit/:userid":"editProfile",
        "actions": "actionList",
        "action/:id": "actionDetail",
        "mapping/:id": "mappingDetail"
    },
    home: function(){
        if(!local_session.get('logged')){
            console.log("new session");
            this.homeView = new HomeView();
            $("#app").html(this.homeView.render().el);
        }else{
            //var authdata = JSON.parse(localStorage.getItem("authdata"));
            console.log("open session");
            //var userid = window.authdata.userid;
            //this.userModel = new User({id:userid});
            var userid = local_session.get('userid');
            my_user.fetch({data:{'id':userid}});
            this.profileView = new ProfileView({model:my_user});
            $("#app").html(this.profileView.render().el);
            this.loadNav('default');
        }
    },

    back: function(){
        window.history.go(-2);
        console.log(window.history.previous);
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
    logout: function(){
        var logout_data = {
            "username": null,
            "token" : null,
            "userid": null,
            "logged": false
        };
        local_session.set(logout_data);
        localStorage.setItem("authdata", JSON.stringify(logout_data));
        this.navigate("/", {trigger: true});
    },
    loadProfile: function(userid){
        //this.userModel = new User({id:userid});
        my_user.fetch({data:{'id':userid}});
        this.profileView = new ProfileView({model:my_user});
        $("#app").html(this.profileView.render().el);
        this.loadNav('default');

    },

    editProfile: function(userid){
        //var authdata = JSON.parse(localStorage.getItem("authdata"));
        //var uname = authdata.username;
        //var token = authdata.token;
        //this.userModel = new User({id:userid});
        //this.userModel.fetch();
        this.profileEditView = new ProfileEditView({model:my_user});
        $("#app").html(this.profileEditView.render().el);
        this.loadNav('default');
    },
    actionList: function(){
        //this.actionModel = new Action();
        this.actionCollection = new ActionCollection();
        var self = this;
        this.actionCollection.fetch({
            //data: {orderby:'-created'},
            success: function(collection, response){
                 self.actionView = new ActionView({model: self.actionCollection});
                $("#app").html(self.actionView.render().el);
                self.loadNav('report');
            }   
        });  
    },

    actionDetail: function(id){

        this.actionModel = new Action();
        //this is hacky
        //rather make the collection global 
        //and get the model from it
        var url = api_url + "/api/v1/mapping/" + id;
        this.actionModel.url = url;
        console.log(url);
        var self = this;
        this.actionModel.fetch({
            success:function(){
                console.log("image: " + self.actionModel.get('image'));
                self.actionDetailView = new ActionDetailView({model : self.actionModel});
                $("#app").html(self.actionDetailView.render().el);
                self.loadNav('report');
               
            }
        });
    },

    mappingDetail: function(id){
        console.log(id);
    },

    loadNav: function(mode){
        this.navModel = new Navbar({});
        var nav_data = [];
        if(mode == 'default'){
            nav_data = [
                {name: "acciones" , link : "#actions"},
                {name: "historial", link: "#history"},
                {name: "mi perfil", link: "#user/" + my_user.get("id")}
            ];           
        }else{
             nav_data = [
                {name: "volver", link: "#back"},
                {name: "inicio" , link: "#"},
                {name: "dateos" , link: "#dateos"},
                {name: "crear dateo" , link: "#dateo/create"}
            ];  
        }
        this.navModel.set({"nav":nav_data });
        this.navView = new NavbarView({model: this.navModel});
        console.log(JSON.stringify(my_user.toJSON()));
        $("#nav").html(this.navView.render().el);
    }
});


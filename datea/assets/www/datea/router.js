///////ROUTER//////////
var api_url = "http://192.168.2.113:8000";

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
        "mapping/:id": "mappingDetail",
        "mapping/:id/reports": "mapItemList",
        "mapping/report/:id": "mapItemDetail"
    },
    home: function(){
        if(!local_session.get('logged')){
            console.log("new session");
            //this.homeView = new HomeView();
            $("#app").html(new HomeView.render().el);
        }else{
            //var authdata = JSON.parse(localStorage.getItem("authdata"));
            console.log("open session");
            //var userid = window.authdata.userid;
            //this.userModel = new User({id:userid});
            var userid = local_session.get('userid');
            my_user.fetch({data:{'id':userid}});
            //this.profileView = new ProfileView({model:my_user});
            //$("#app").html(this.profileView.render().el);
            //this.loadNav('default');
            loadProfile(userid);
        }
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
        //this.navView = new NavbarView({model: this.navModel});
        console.log(JSON.stringify(my_user.toJSON()));
        $("#nav").html(new NavbarView({model: this.navModel}).render().el);
    },

    back: function(){
        window.history.go(-2);
        console.log(window.history.previous);
    },

    login: function(){
        this.session = new Session();
        //this.loginView = new LoginView({model: this.session});
        $("#app").html(new LoginView({model:this.session}).render().el);

    },
    register: function(){
        this.session = new Session();
        //this.registerView = new RegisterView({model: this.session});
        $("#app").html(new RegisterView({model: this.session}).render().el);
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
        //this.profileView = new ProfileView({model:my_user});
        $("#app").html(new ProfileView({model:my_user}).render().el);
        this.loadNav('default');

    },

    editProfile: function(userid){
        //var authdata = JSON.parse(localStorage.getItem("authdata"));
        //var uname = authdata.username;
        //var token = authdata.token;
        //this.userModel = new User({id:userid});
        //this.userModel.fetch();
        //this.profileEditView = new ProfileEditView({model:my_user});
        $("#app").html(new ProfileEditView({model:my_user}).render().el);
        this.loadNav('default');
    },
    actionList: function(){
        //this.actionModel = new Action();
        this.actionCollection = new ActionCollection();
        var self = this;
        this.actionCollection.fetch({
            //data: {orderby:'-created'},
            success: function(collection, response){
                 //self.actionView = new ActionView({model: self.actionCollection});
                $("#app").html(new ActionView({model:self.actionCollection}).render().el);
                self.loadNav('report');
            }   
        });  
    },

    actionDetail: function(id){

        this.actionModel = new Action();
        //this is hacky
        //rather make the collection global 
        //and get the model  it
        var url = api_url + "/api/v1/mapping/" + id;
        this.actionModel.url = url;
        console.log(url);
        var self = this;
        this.actionModel.fetch({
            success:function(){
                console.log("image: " + self.actionModel.get('image'));
                //self.actionDetailView = new ActionDetailView({model : self.actionModel});
                $("#app").html(new ActionDetailView({model:self.actionModel}).render().el);
                self.loadNav('report');
               
            }
        });
    },

    mapItemList: function(map_id){
        console.log("reportlist");
        this.mapItems = new MapItemCollection();
        //this.itemListView = new ItemListView({model: this.mapItems});
        var self = this;
        this.mapItems.fetch({
            data: {'action':map_id, 'order_by': '-created'},
            success: function(){
                $("#app").html(new ItemListView({model: self.mapItems}).render().el);
                self.loadNav('report');
            }
        });
    },

    mapItemDetail:function(item_id){
        this.mapItem = new MapItem();
        //this.mapItemView = new ItemDetailView({model:this.mapItem});
        var self = this;
        this.mapItem.fetch({
            data:{'id':item_id},
            success: function(){
                $("#app").html(new ItemDetailView({model: self.mapItem}).render().el);
                self.loadNav('report');
            }
        });
   } 
});



$(function(){

    var api_url = "http://192.168.2.113:8000/api/v1";

    ///////////////MODELS///////////////////

//session model

   var SessionModel = Backbone.Model.extend({
       urlRoot: api_url + "/accounts/signin/?format=json",
        defaults: {
            logged: false,
            apiKey: null,
            username: null,
            password: null
        },
    });

//user model

    var DateaUser = Backbone.Model.extend();

    var DateaUserCollection = Backbone.Collection.extend({
        model: DateaUser,
   });

    ////////////////views////////////////////

//home view
    var HomeView = Backbone.View.extend({

        render: function(){
            this.$el.html(ich.home_tpl());
            return this
        },
    });

    var RegisterView = Backbone.View.extend({
        events: {
            "submit": "submitRegister",
            "click h1":"enter"
        },
        render: function(){
            this.$el.html(ich.register_tpl());
            return this;
        },
        submitRegister : function(e){
            e.preventDefault();
            var formdata =$("#register_form").serializeArray();
            //parsing data into a convenient object
            var regdata = {};
            formdata.forEach(function(data){
                console.log(data.name, data.value);
                regdata[data.name] = data.value;
            });
            //validate form 
            if(regdata.password == regdata.confirm_password){
                console.log("validated");   
            }else{
                console.log("error");
            }
            var self = this;           
           //there is no register model, so we're doing plain ajax post to create the user in the server, instead of using model.save(). 
            $.post(api_url + "/accounts/create/?format=json",
                    JSON.stringify(regdata),
                    function(response){
                        console.log(response.status);
                        if(response.status === 200){
                            self.model.set({
                                username: regdata.username,
                                password: regdata.password
                            });
                            $('#result').html(ich.enter());
                        }
                    },
                    'json'
                    );

        },
        enter: function(){
            var self = this;
            var logindata = {
                username: this.model.get('username'),
                password: this.model.get('password')
            };
            //login sent to server
            this.model.save(logindata, {
                 success: function(model, response){
                    console.log("bang");
                    if(response.status == 200){
                        console.log( response);
                        console.log("success");
                        self.model.set({apiKey: response.token});
                        self.model.set({logged: true});
                        //redirecting to user profile for now
                        var uname = self.model.get("username");
                        app.navigate("user/" +uname, {trigger : true});
                    }else if(reponse.error){
                        console.log(response.error);
                        $("#result").html(response.error);
                    }
                }
            });
        }

    });
//session view
    var LoginView = Backbone.View.extend({

        events:{
            "submit #login_form": "loginSubmit",
        },
        render: function(event){
            this.$el.html(ich.login_form_tpl());
            return this;
        },

        loginSubmit: function(e){
            e.preventDefault();
            var usr = $("#usr").val();
            var pss = $("#pss").val();
            var self = this;
            this.model.save({username:usr, password:pss},{
                success: function(model, response){
                    console.log("bang");
                    if(response.status == 200){
                        console.log( response);
                        console.log("success");
                        self.model.set({apiKey: response.token});
                        self.model.set({logged: true});
                        var uname = self.model.get("username");
                        app.navigate("user/" +uname, {trigger : true});
                    }else if(reponse.error){
                        console.log(response.error);
                        $("#result").html(response.error);
                    }
                },
                error: function(response){
                    console.log(response);
                    $("#result").html("Ocurrio un error");
                }
            });
            return;
        }
    });

    //user view
    var DateaUserView = Backbone.View.extend({ 
        
        initialize: function(){
            this.model.bind("change", this.render, this);
        },

        render: function(){
            //evaluate the object is not empty
            if(this.model.get('objects') !== undefined){
                this.dat = this.model.get('objects')[0];
                console.log("username:  " + this.dat.username);
                this.$el.html(ich.user_profile_tpl(this.dat));
            }
            return this;
        }
    });

    var AppRouter = Backbone.Router.extend({

        initialze: function(){
        /*
        the logic works but something (zepto, browser?) 
        is removing the port number from the url string
        possibly same origin policy 
        */
        //$.ajaxSettings.url = api_url + "/accounts/signin/?format=json";// 
         $.ajaxSettings.accepts = 'json';
         $.ajaxSettings.crossDomain = true;
      
        },
        routes: {
            "":"home",
            "login":"login",
            "register": "register",
            "user/:username": "loadUser"
        },
        home: function(){
            this.homeView = new HomeView();
            $("#app").html(this.homeView.render().el);
        },
        login: function(){
            this.session = new SessionModel();
            this.loginView = new LoginView({model: this.session});
            $("#app").html(this.loginView.render().el);
        },
        register: function(){
            this.session = new SessionModel();
            this.registerView = new RegisterView({model: this.session});
            $("#app").html(this.registerView.render().el);
        },
        loadUser: function(username){
            this.userModel = new DateaUser();
            this.userModel.urlRoot = api_url + "/user/?username=" + username
            
            this.userModel.fetch();
            this.userView = new DateaUserView({model:this.userModel});
            $("#app").html(this.userView.render().el);
        }
    });

    var app = new AppRouter();
    Backbone.history.start();
});

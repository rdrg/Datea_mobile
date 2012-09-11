$(function(){

    var api_url = "http://localhost:8000";

    ////////////////MISC////////////////////
    //parse form data into a convenient object
    var formDeserialize = function(formdata){
            var output = {};
            formdata.forEach(function(data){
                //console.log(data.name, data.value);
                output[data.name] = data.value;
            });
            return output;
    };

    ///////////////MODELS///////////////////

    //SESSION MODEL

   var SessionModel = Backbone.Model.extend({
       urlRoot: "/api/v1/accounts/signin/",
        defaults: {
            logged: false,
            apiKey: null,
            username: null,
            //password: null,
            userid: null
        }
    });

    //USER MODEL

    var DateaUser = Backbone.Model.extend({
        urlRoot:"/api/v1/user/"
    });


    var DateaUserCollection = Backbone.Collection.extend({});

    //PROFILE MODEL

    var DateaProfile = Backbone.Model.extend({
        urlRoot:"/api/v1/profile/"
    });

    var Image = Backbone.Model.extend({
        urlRoot: "/image"
    });

    var ImageCollection = Backbone.Collection.extend({
        model: Image,
        url: "api/v1/image"
    });


    ////////////////views////////////////////

    //HOME VIEW
    var HomeView = Backbone.View.extend({

        render: function(){
            this.$el.html(ich.home_tpl());
            return this;
        }
    });

    // REGISTER VIEW
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
            $.post(api_url + "/api/v1/accounts/create/",
                    JSON.stringify(regdata),
                    function(response){
                        //console.log(response.status);
                        if(response.status === 200){
                            self.model.set({
                                username: regdata.username,
                                password: regdata.password
                            });
                            $('#result').html(ich.enter());
                        }
                    }
                    //'json'
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
                    if(response.status == 200){
                        var authdata = {
                            "username": logindata.username,
                            //"password": logindata.password,
                            "apiKey" : response.token,
                            "logged" : true,
                            "userid" : response.userid
                        };

                          Backbone.Tastypie = {
                            prependDomain: api_url,
                            doGetOnEmptyPostResponse: true,
                            doGetOnEmptyPutResponse:false,
                            apiKey : {
                                username: logindata.username,
                                key: response.token 
                            }
                        };

                        localStorage.setItem("authdata", JSON.stringify(authdata));
                        self.model.set(authdata);
                        //self.model.set({logged: true});
                        //redirecting to user profile for now
                        //var userid = self.model.get("userid");
                        //console.log("uierid: " + response.userid);
                        app.navigate("user/" + response.userid, {trigger : true});
                    }else if(reponse.error){
                        $("#result").html(response.error);
                    }
                }
            });
        }

    });

    //SESSION VIEW
    var LoginView = Backbone.View.extend({

        events:{
            "submit #login_form": "loginSubmit"
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
            var data = {"username": usr, "password": pss};
            this.model.save({username:usr, password:pss},{
                success: function(model, response){
                    //console.log("bang");
                    if(response.status == 200){
                        //console.log( response);
                        //console.log("success");
                        self.model.set({username: usr});
                        self.model.set({apiKey: response.token});
                        self.model.set({userid: response.userid});
                        self.model.set({logged: true});
                        var uname = self.model.get("username");
                        var userid = self.model.get("userid");
                        var localdata = {
                            "username": uname,
                            "token": response.token,
                            "userid": userid,
                            "logged" : self.model.get("logged")
                        };

                        localStorage.setItem("authdata",JSON.stringify(localdata));
                        Backbone.Tastypie = {
                            prependDomain: api_url,
                            doGetOnEmptyPostResponse: true,
                            doGetOnEmptyPutResponse:false,
                            apiKey : {
                                username: uname,
                                key: response.token 
                            }
                        };
                        app.navigate("user/" +userid, {trigger : true});
                        //console.log("userid: " + userid);
                    }else if(response.error){
                        //console.log(response.error);
                        $("#result").html(response.error);
                    }
                },
                 //'json'
                
                error: function(response){
                    //console.log(response);
                    $("#result").html("Ocurrio un error");
                }
            
            });
            return;
        }
    });

    //USER VIEW
    var DateaUserView = Backbone.View.extend({ 
        
        initialize: function(){
            this.model.bind("change", this.render, this);
        },

        render: function(){
            //evaluate the object is not empty
            
            this.dat = this.model.toJSON();
            this.$el.html(ich.user_profile_tpl(this.dat));
            return this;
        }
    });

    //EDIT USER VIEW
    var UserEditView = Backbone.View.extend({
        events:{
          "submit #user_edit_form": "updateUser"  
        },
        //initialize: function(){
          //  console.log($.cookie("csrftoken"));
        //},
        render: function(){
                this.$el.html(ich.edit_user_tpl());
                return this;
            },

        updateUser: function(ev){
            ev.preventDefault();
            var profile = new DateaProfile(this.model.get('profile'));
            profile.set({"full_name": $("#fullname_in").val()});
            this.model.set({'profile': profile.toJSON()});  
            var self = this;
            
            var profile_img = new Image();
            
            var img_data = {
                object_type: 'DateaProfile',
                object_id : this.model.get('profile').id,
                object_field: 'image',
                thumb_preset: 'profile_image_large'

            };

            if(localStorage.getItem("authdata")){
                var authdata = JSON.parse(localStorage.getItem("authdata"));
                //console.log("token: " + authdata.token);
                //console.log("api key: " + Backbone.Tastypie.apiKey.key);
            
                $.ajax(api_url + '/image/api_save/', {
                    type: 'POST',
                    data: img_data,
                    files: $(":file", this.$el),
                    iframe: true,
                    crossDomain: true,
                    processData: false,
                    headers: {'Authorization': 'ApiKey '+ authdata.username + ':' + authdata.token }
                });

                this.model.save({},{
                    success: function(){
                        app.navigate("user/" + self.model.get("id"), {trigger: true});
                    }
                });
                
            }else{
                console.log("no auth data, not sending");
            }
        }
    });

    //////////////////ROUTER///////////////////
    var AppRouter = Backbone.Router.extend({
        
        initialize: function(){
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
            "user/:userid": "loadUser",
            "user/edit/:userid":"editUser"
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
        loadUser: function(userid){
            this.userModel = new DateaUser({id:userid});
            this.userModel.fetch();
            this.userView = new DateaUserView({model:this.userModel});
            $("#app").html(this.userView.render().el);
        },

        editUser: function(userid){
            var authdata = JSON.parse(localStorage.getItem("authdata"));
            var uname = authdata.username;
            var token = authdata.token;
            this.userModel = new DateaUser({id:userid});
            this.userModel.fetch();
            this.userEditView = new UserEditView({model:this.userModel});
            $("#app").html(this.userEditView.render().el);
        }
    });

    var app = new AppRouter();
    Backbone.history.start();
});

$(function(){

    $(document).ready(function(){
        $("#login_form").submit(function(form){
            form.preventDefault();
        });
    });

//session model

   var SessionModel = Backbone.Model.extend({
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
        //url: "http://192.168.2.113:8000/api/v1/user/",
    });

//session view
    var LoginView = Backbone.View.extend({

        el:$("#login"),
        events:{
            "submit #login_form": "loginSubmit",
            "change #usr ": "setUser",
            "change #pss": "setPss"
        },
        /*
        //not sure we need this
        initialize: function(){
            var self = this;
            this.model.bind("change", this.render, this);

        },
        render: function(event){
            $("#result").html("Login Successful");
        },
        */

        loginSubmit: function(e){
            //e.preventDefault();
        	console.log("bang");
            var usr = this.model.get('username');
            var pss = this.model.get('password');
            var that = this;
            var data = {username: usr, password : pss};
            console.log(data.username, data.password);
            $.post("http://192.168.2.113:8000/api/v1/accounts/signin/?format=json",
                    JSON.stringify(data),
                    function(response){
                        if (response.status == 200){
                            that.model.set({apiKey: response.token});
                            that.model.set({logged: true});
                            $('#result').html("Login Successful")
                            that.userModel = new DateaUser();
                            that.userModel.urlRoot = "http://192.168.2.113:8000/api/v1/user/?username=" + usr;
 that.userModel.fetch();
                            //that.userModel.fetch();
                            that.userView = new DateaUserView({model: that.userModel});
                            
                            //that.userView.render();

                            /*
                            that.userCollection = new DateaUserCollection();
                            that.userModel = new DateaUser();
                            that.userCollection.fetch({
                                data : {"username": usr},
                                success: function(){
                                    console.log("data loaded");
                                }
                            });
                            //that.userView = new DateaUserView({model: that.userCollection});
                            //that.userView.model.fetch({data:{username: usr}});
                            */
                        }else{
                            console.log("error with login");
                            console.log(response.error);
                            $("#result").html("Error");
                        }
                    },
                    "json"
                  );
            return;
        },
        setUser: function(){
            console.log("usr set");
            this.model.set({username: $("#usr").val()});
        },
        setPss: function(){
            console.log('psss set');
            this.model.set({password: $("#pss").val()})
        }

    });

    var DateaUserView = Backbone.View.extend({

        el: $("#user_data"),  
        
        initialize: function(){
            this.model.bind("change", this.render, this);
        },

        render: function(event){
            var dat = this.model.get('objects')[0];
            console.log("username:  " + dat);
            this.$el.html(ich.user_profile(dat));
            //$("#user_data").append(JSON.stringify(this.model));
        }
    });

    var AppRouter = Backbone.Router.extend({
        routes: {
            "":"home"
        },
        home: function(){
            this.session = new SessionModel();
            this.loginView = new LoginView({model: this.session});
        }
    });

var app = new AppRouter();
Backbone.history.start();
});

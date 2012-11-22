window.LoginView = Backbone.View.extend({
	events: {
        "submit #login-form": "loginSubmit",
        "focus input": "typing"
    },
    
	initialize: function () {
		this.render();
	},
	render: function () {
		this.$el.html(this.template);
		return this;
	},
	loginSubmit: function(e) {
        e.preventDefault();
        var usr = $("#usr").val();
        var pss = $("#pss").val();
        var self = this;
        var data = { "username": usr, "password": pss };
        
        this.model.save({ username: usr, password: pss },{ 
            success: function(model, response) {
                if(response.status == 200){
                    /*
                    self.model.set({ username: usr });
                    self.model.set({ token: response.token });
                    self.model.set({ userid: response.userid });
                    self.model.set({ logged: true });
                    
                    var uname = self.model.get("username");
                    var userid = self.model.get("userid");
                    */
                    
                    var localdata = {
                        "username": usr,
                        "token": response.token,
                        "userid": response.userid,
                        "logged": true
                    };
                    self.model.set(localdata);
                    self.model.unset("password");
                    //localStorage.setItem("authdata", JSON.stringify(localdata));
                    //console.log("login data: " + JSON.stringify(self.model));
                    localStorage.setItem("authdata", JSON.stringify(self.model));

                    Backbone.Tastypie = {
                        prependDomain: api_url,
                        doGetOnEmptyPostResponse: true,
                        doGetOnEmptyPutResponse:false,
                        apiKey : {
                            username: model.get('username'),
                            key: model.get('token')
                        }
                    };
                    
                    if(!window.localUser){
                        window.localUser = new User();
                    }
                    localUser.fetch({
                            data: {
                            	'id': self.model.get('userid'),
                            	'api_key': self.model.get('token'),
                        		'username': self.model.get('username'),
                            	'user_full': 1,
                            },
                            success: function(){
                                dateaApp.navigate("/", {trigger: true});
                            },
                            error: function () {
                            	onOffline();
                            }
                    });
                
                } else if(response.error) {
                    //$("#result").html(response.error);
                    alert("Usuario o contrasena invalidos");
                }
            },            
            error: function(response) {
                //$("#result").html("Ocurrio un error");
                onOffline();
            }
        });
        return;
    },
    typing: function(event){
        this.eventAggregator.trigger("footer:hide");
    }
});

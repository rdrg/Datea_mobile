window.LoginView = Backbone.View.extend({
	events: {
        "submit #login-form": "loginSubmit",
        "focus input": "typing"
    },
    
	initialize: function () {
		this.render();
	},
	render: function () {
            /*
		if (localSession.get('logged')) {
			var userid = localSession.get('userid');
			dateaApp.navigate("user/" + userid, { trigger : true });
		}
                */
		
		this.$el.html(this.template);
		return this;
	},
	loginSubmit: function(e) {
        e.preventDefault();
        var usr = $("#usr").val();
        var pss = $("#pss").val();
        var self = this;
        var data = { "username": usr, "password": pss };
        
        this.model.save({ username: usr, password: pss }, {
            success: function(model, response) {
                if(response.status == 200){
                    self.model.set({ username: usr });
                    self.model.set({ token: response.token });
                    self.model.set({ userid: response.userid });
                    self.model.set({ logged: true });
                    
                    var uname = self.model.get("username");
                    var userid = self.model.get("userid");
                    console.log("submit login desde el cliente");
                    
                    var localdata = {
                        "username": uname,
                        "token": response.token,
                        "userid": userid,
                        "logged": self.model.get("logged")
                    };

                    //localStorage.setItem("authdata", JSON.stringify(localdata));
                    //localStorage.setItem("authdata", JSON.stringify(this.model));

                    Backbone.Tastypie = {
                        prependDomain: api_url,
                        doGetOnEmptyPostResponse: true,
                        doGetOnEmptyPutResponse:false,
                        apiKey : {
                            username: uname,
                            key: response.token
                        }
                    };
                    
                    if(!window.localUser){
                        window.localUser = new User();
                    }
                    localUser.fetch({
                            data: {'id': localSession.get('userid')},
                            success: function(){
                 
                               //dateaApp.navigate("user/" + userid, { trigger : true });
                                dateaApp.navigate("/actions", {trigger: true});
                                //render loggedIn header
                                self.headerView = new LoggedInHeaderView();
                                $('#header').html(self.headerView.render().el);
                                   
                            }
                            
                    });
                
                } else if(response.error) {
                    //$("#result").html(response.error);
                    alert("Usuario o contrasena invalidos");
                }
            },            
            error: function(response) {
                //$("#result").html("Ocurrio un error");
                alert('Ocurrion un error, revisa tu conexion a internet');
            }
        });
        return;
    },
    typing: function(event){
        this.eventAggregator.trigger("footer:hide");
    }
});

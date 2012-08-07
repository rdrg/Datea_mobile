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

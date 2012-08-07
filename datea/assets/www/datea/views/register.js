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


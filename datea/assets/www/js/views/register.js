// REGISTER VIEW



var RegisterView = Backbone.View.extend({
    
    events: {
        "submit": "submitRegister",
        "click h1": "enter"
    },
    
    render: function(){
        this.$el.html(this.template());
        return this;
    },
    
    submitRegister : function(e){
        e.preventDefault();
        var formdata =$("#register-form", this.$el).serializeArray();
        //parsing data into a convenient object
        var regdata = {};
        formdata.forEach(function(data){
            console.log(data.name, data.value);
            regdata[data.name] = data.value;
        });
        
        //validate form
        if (!this.validate_form(regdata)) return;
        
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
                    $('#result').html('<h1>enter</h1>');
                }
            }
            //'json'
            );
    },
    
    validate_form: function(data) {
    	
    	var error = false;
    	var check_uname = /^[A-Za-z0-9-_]{3,20}$/;
    	var check_email = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    	
    	// username
    	if ($.trim(data.username) == '' || !check_uname.test(data.username)) {
    		error = "Ingresa un nombre de usuario de 3 a 20 characteres (alphanumericos, guión, guión bajo)";
    	}
    	
    	// email
    	else if ($.trim(data.email) == '' || !check_email.test(data.email)) {
    		error = "Ingresa un correo electrónico valido.";
    	}
    	
    	// password
    	else if (data.password == '') {
    		error = "Ingresa una contraseña";
    	}
    	
    	// password confirm
    	else if (data.password != data.confirm_password) {
    		error = "Las contraseñas no coinciden.";
    	}
    	
    	if (!error) { 
    		return true;
    	}else{
    		//navigator.notification.alert(error, function(){}, 'Error de validación', 'ok');
    		alert(error);
    		return false;
    	}
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
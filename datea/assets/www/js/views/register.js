// REGISTER VIEW



var RegisterView = Backbone.View.extend({
    
    events: {
        "submit #register-form": "submitRegister",
        "tap .register-submit": "submitRegister",
        "tap .enter": "enter"
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
            regdata[data.name] = data.value;
        });
        
        //validate form
        if (!this.validate_form(regdata)) return;
        
        var self = this;
       //there is no register model, so we're doing plain ajax post to create the user in the server, instead of using model.save().
        /*
        $.post(api_url + "/api/v1/accounts/create/",
            JSON.stringify(regdata),
            function(response){
                //console.log(response.status);
                if(response.status === 200){
                    self.model.set({
                        username: regdata.username,
                        password: regdata.password
                    });
                    $('#result').html('<h1 class="enter">enter</h1>');
                }else{
                	console.log(reponse)
                }
            }
            //'json'
         );*/
         $.post(api_url+"/api/v1/accounts/create/", JSON.stringify(regdata))
         	.complete(function(data){
         		
         		response_msg = $.parseJSON(data.responseText);
         		
         		if (response_msg.status == 200) {
         			
         			self.model.set({
                        username: regdata.username,
                        password: regdata.password
                    });
                    self.$el.html(new RegisterSuccessView().render().el);
         			
         		} else if (response_msg.status == 500) {
         			var error;
         			
         			if (response_msg.error_message.indexOf('auth_user_username_key') !== -1) {
         				error = "El nombre de usuario ya ha sido tomado. Por favor, elige otro.";
         				
         			}else if (response_msg.error_message.indexOf('Recipient address rejected') !== -1) {
         				error = "La dirección de correo no exite o tiene problemas.";
         				
         			}else if (response_msg.error_message.indexOf('duplicate email') !== -1) {
         				error = "Ya existe una cuenta con este correo. Si te olvidaste de tu contraseña, recupérala en la web en "+api_url+".";
         		
         			}else{
         				error = "Ocurrio un error. Revisa tus datos e inténtalo de nuevo.";	
         			}
         			//navigator.notification.alert(error, function(){}, 'Error de validación', 'ok');
    				alert(error);
         		}
         	});
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
                        apiKey: {
                            username: logindata.username,
                            key: response.token
                        }
                    };

                    localStorage.setItem("authdata", JSON.stringify(authdata));
                    self.model.set(authdata);
                    
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
                    dateaApp.navigate("/", { trigger: true });
                
                }else if(response.error){
                	var error = "Aún te falta activar tu cuenta."
                	//navigator.notification.alert(error, function(){}, 'Error de activación', 'ok');
		    		alert(error);
		    		return false;
                }
            },
            error: function() {
            	onOffline();
            }
        });
    }

});
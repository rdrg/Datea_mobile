var ProfileEditView = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this, "win");
    },
    events: {
      //"click #image_input": "browseImage",  
      "click #image_input": "addImageOverlay",	
      "submit #user_edit_form": "transferImage"
    },
    render: function() {
    	console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    updateUser: function(ev) {
        ev.preventDefault();
        
        var self = this;
        var profile = new Profile(this.model.get('profile'));
        
        profile.set({
            "full_name": $("#fullname_in").val(),
            "email": $("#email_in").val(),
            "message": $("#message_in").val()
        });
        
        this.model.set({ 'profile': profile.toJSON() });
        
        var profile_img = new Image();
        
        var img_data = {
            object_type: 'DateaProfile',
            object_id : this.model.get('profile').id,
            object_field: 'image',
            thumb_preset: 'profile_image_large'
        };

        if(localStorage.getItem("authdata")) {
            var authdata = JSON.parse(localStorage.getItem("authdata"));
            
            var im = $("#image_path").text();
            console.log("image: " + im);    
            $.ajax(api_url + '/image/api_save/', {
                type: 'POST',
                data: img_data,
                files: $(":file", this),
                iframe: true,
                crossDomain: true,
                processData: false,
                headers: { 'Authorization': 'ApiKey '+ authdata.username + ':' + authdata.token }
            });
            
            profile.save({}, {
                success: function() {
                    app.navigate("user/" + self.model.get("id"), { trigger: true });
                }
            });
        } else {
            console.log("no auth data, not sending");
        }
    },

    transferImage: function(event){
        event.preventDefault();

        var self = this;
        var profile = new Profile(this.model.get('profile'));
        
        profile.set({
            full_name: $("#fullname_in").val(),
            message: $("#message_in").val()
        });
        
        this.model.set({ 
        	profile: profile.toJSON(),
        	email: $("#email_in").val(), 
        });
        
        var image_uri=  $("#image_data").val();
        
        if (image_uri != '') {
        	console.log("sending image");
	        var profile_img = new Image();
	 
	        var transfer = new FileTransfer();
	        var options = new FileUploadOptions();
	
	        //options.fileKey = "file";
	        options.mimeType = "image/jpeg";
	        options.fileName = image_uri.substr(image_uri.lastIndexOf('/')+1);
	        options.fileKey = 'image';
	        options.chunkedMode = false;
	        
	        var params = {
	        	object_type: 'DateaProfile',
	        	object_id: this.model.get('profile').id,
	        	object_field: 'image',
	        	thumb_preset: 'profile_image_large'
	        };
	
	        params.headers = { 
	            'Authorization': 'ApiKey '+ localSession.username + ':' + localSession.token, 
	            'enctype': 'multipart/form-data'
	        };
	        options.params = params;
	
	        //if(localStorage.getItem("authdata")) {
	            //var authdata = JSON.parse(localStorage.getItem("authdata"));
	                    
	        //var im = $("#image_path").text();
	        //console.log("image: " + image_uri);    
	                        
	        transfer.upload(image_uri, encodeURI(api_url + "/image/api_save/"), self.win, self.fail, options);
		}else{
			var self = this;
			this.model.save({}, {
	            success: function() {
	                dateaApp.navigate("user/" + self.model.get("id"), { trigger: true });
	            },
	         	error: function(error) {
	         		alert('Error de conexión. Revisa tu conexión e intenta nuevamente.');
	         	}
	        });
		}
    },
 
    browseImage: function(event){
        event.preventDefault();
        var self = this;
        if (!this.image_browser_opened) {
        	this.image_browser_opened = true;
	        navigator.camera.getPicture(
	            function(imageURI){
	                //alert(imageURI);
	                this.image_browser_opened = false;
	                $("#image_data").val(imageURI);
                        $("#profile_image").attr("src", imageURI);
	            },
	            function(message){
	            	this.image_browser_opened = false;
	                alert(message);
	            },
	            {
	                quality: 50,
	                destinationType: navigator.camera.DestinationType.FILE_URI,
	                //sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
	                //destinationType: navigator.camera.DestinationType.DATA_URL,
	                sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
	            }
	        );
	    }
    },

    win: function(r){
		
		var jres = JSON.parse(r.response);
        var im = jres.resource;
        
        var self = this;
   		this.model.save({image: im}, {
            success: function(model) {
                dateaApp.navigate("user/" + self.model.get("id"), { trigger: true });
            },
         	error: function(error) {
         		alert('Error de conexión. Revisa tu conexión e intenta nuevamente.');
         	}
        });
    },

    fail: function(error){
        console.log("error Code = " + error.code);
        console.log("upload error source: " + error.source);
        console.log("upload error target: " + error.target);
    },

    uploadImage: function(ev) {
        ev.preventDefault();
        
        var self = this;
        var profile = new Profile(this.model.get('profile'));
        
        profile.set({
            "full_name": $("#fullname_in").val(),
            "email": $("#email_in").val(),
            "message": $("#message_in").val()
        });
        
        this.model.set({ 'profile': profile.toJSON() });
        
        var profile_img = new Image();
        //var image_data = "data:image/jpeg;base64," + $("#image_data").val();
        var image_data = $("#image_data").val();
        console.log("image data: " + image_data);

        var img_data = {
            object_type: 'DateaProfile',
            object_id : this.model.get('profile').id,
            object_field: 'image',
            thumb_preset: 'profile_image_large',
            file: image_data 
            //file: image_data
        };

       // if(window.localUser.logged) {
            
            $.ajax(api_url + '/image/mobile_save/', {
                type: 'POST',
                data: img_data,
                crossDomain: true,
                //processData: false,
                headers: { 'Authorization': 'ApiKey '+ localSession.get('username') + ':' + localSession.get('token') }
            });
            
            profile.save({}, {
                success: function() {
                    app.navigate("user/" + self.model.get("id"), { trigger: true });
                }
            });
        //} else {
          //  console.log("no auth data, not sending");
        //}
    },

    addImageOverlay:function(ev){
        ev.preventDefault();
        this.imageOverlay = new ProfileImageOverlayView();
        this.$("#image_overlay").html(this.imageOverlay.render().el);
    }
});

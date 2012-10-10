var ProfileEditView = Backbone.View.extend({
    events: {
      "click #image_input": "browseImage",  
      //"click #image_input": "browseImage",	
      "submit #user_edit_form": "uploadImage"
    },
    render: function() {
        this.$el.html(this.template);
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
        console.log("sending image");
        var self = this;
        var profile = new Profile(this.model.get('profile'));
        
        profile.set({
            "full_name": $("#fullname_in").val(),
            "email": $("#email_in").val(),
            "message": $("#message_in").val()
        });
        
        this.model.set({ 'profile': profile.toJSON() });
        
        var profile_img = new Image();
 
        var transfer = new FileTransfer();
        var options = new FileUploadOptions();
        var image_uri = $("#file_path_input").val();

        //options.fileKey = "file";
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        params = new Object();
        params.object_type = 'DateaProfile';
        params.object_id = this.model.get('profile').id;
        params.object_field = 'image';
        params.thumb_preset = 'profile_image_large';
        params.headers = { 
            'Authorization': 'ApiKey '+ window.localUser.username + ':' + window.localUser.token, 
            'enctype': 'multipart/formdata'
        };
        options.params = params;

        //if(localStorage.getItem("authdata")) {
            //var authdata = JSON.parse(localStorage.getItem("authdata"));
                    
        //var im = $("#image_path").text();
        console.log("image: " + image_uri);    
                        
        transfer.upload(image_uri, encodeURI(api_url + "/image/api_save/"), self.win, self.fail, options);
        profile.save({}, {
            success: function() {
                app.navigate("user/" + self.model.get("id"), { trigger: true });
            }
        });

       // }
    },
 
    browseImage: function(event){
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
                //alert(imageURI);
                $("#image_data").val(imageURI);
            },
            function(message){
                alert(message);
            },
            {
                quality: 50,
                //destinationType: navigator.camera.DestinationType.FILE_URI,
                //sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
            }
        );
    },

    win: function(r){
        console.log("Code = " + r.responseCode);
        console.log("Response= " + r.response);
        console.log("Sent = " + r.bytesSent);
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
        var image_data = "data:image/jpeg;base64," + $("#image_data").val();
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
                headers: { 'Authorization': 'ApiKey '+ window.localUser.username + ':' + window.localUser.token }
            });
            
            profile.save({}, {
                success: function() {
                    app.navigate("user/" + self.model.get("id"), { trigger: true });
                }
            });
        //} else {
          //  console.log("no auth data, not sending");
        //}
    }

});

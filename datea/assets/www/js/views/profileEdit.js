var ProfileEditView = Backbone.View.extend({
    events: {
      "click #image_button": "browseImage",	
      "submit #user_edit_form": "updateUser"
    },
    initialize: function(){
       console.log("inicio");
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
            
            $.ajax(api_url + '/image/api_save/', {
                type: 'POST',
                data: img_data,
                files: $("#image_path").text(),
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
    
    browseImage: function(event){
        event.preventDefault();
            navigator.camera.getPicture(
                function(imageURI){
                    alert(imageURI);
                    $("#image_path").html( imageURI);
                },
                function(message){
                    alert(message);
                },
                {
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    //sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                    sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM

                }
            );
        }
});

//EDIT USER VIEW

var ProfileEditView = Backbone.View.extend({
    events:{
      "submit #user_edit_form": "updateUser"  
    },
    //initialize: function(){
      //  console.log($.cookie("csrftoken"));
    //},
    render: function(){
            this.$el.html(ich.edit_user_tpl());
            return this;
        },

    updateUser: function(ev){
        ev.preventDefault();
        var self = this;
        var profile = new Profile(this.model.get('profile'));
        profile.set({
            "full_name": $("#fullname_in").val(), 
            "email": $("#email_in").val(),
            "message": $("#message_in").val()
        });
        this.model.set({'profile': profile.toJSON()});  
        
        var profile_img = new Image();
        
        var img_data = {
            object_type: 'DateaProfile',
            object_id : this.model.get('profile').id,
            object_field: 'image',
            thumb_preset: 'profile_image_large'

        };

        if(localStorage.getItem("authdata")){
            var authdata = JSON.parse(localStorage.getItem("authdata"));
            //console.log("token: " + authdata.token);
            //console.log("api key: " + Backbone.Tastypie.apiKey.key);
        
            $.ajax(api_url + '/image/api_save/', {
                type: 'POST',
                data: img_data,
                files: $(":file", this.$el),
                iframe: true,
                crossDomain: true,
                processData: false,
                headers: {'Authorization': 'ApiKey '+ authdata.username + ':' + authdata.token }
            });

            profile.save({},{
                success: function(){
                    app.navigate("user/" + self.model.get("id"), {trigger: true});
                }
            });
            
        }else{
            console.log("no auth data, not sending");
        }
    }
});


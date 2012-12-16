var ProfileEditView = Backbone.View.extend({
   
    initialize: function(){
        _.bindAll(this, "win");
    },
    
    new_image_uri: '',
    
    events: {
      "tap #image_input": "addImageOverlay",	
      "submit #user_edit_form": "updateUser",
      "tap .profile-submit": "updateUser",
    },
    
    events_active: false,

    render: function() {
    	var context = this.model.toJSON();
    	if (context.profile.full_name == null) context.profile.full_name = '';
        this.$el.html(this.template(this.model.toJSON()));
        var self = this;
        setTimeout(function(){
        	self.events_active = true;
        }, 500);
        return this;
    },

    updateUser: function(event){
    	
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
        
        if (this.new_image_uri != '') {
        	$('#spinner').fadeIn("fast");
        	//console.log("sending image");
	        var profile_img = new Image();
	 
	        var transfer = new FileTransfer();
	        var options = new FileUploadOptions();
	
	        //options.fileKey = "file";
	        options.mimeType = "image/jpeg";
	        options.fileName = this.new_image_uri.substr(this.new_image_uri.lastIndexOf('/')+1);
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
	                        
	        transfer.upload(this.new_image_uri, encodeURI(api_url + "/image/api_save/"), self.win, self.fail, options);
		}else{
			var self = this;
			this.model.save({
				'api_key': localSession.get('token'),
			}, {
	            success: function(model) {
	                dateaApp.navigate("user/" + self.model.get("id"), { trigger: true });
	            },
	         	error: function(error) {
	         		onOffline();
	         	}
	        });
		}
    },

    win: function(r){
		
		var jres = JSON.parse(r.response);
        var im = jres.resource;
        
        var self = this;
   		this.model.save({
   			image: im,
   			'api_key': localSession.get('token'),
   		}, {
            success: function(model) {
                dateaApp.navigate("user/" + self.model.get("id"), { trigger: true });
            },
         	error: function(error) {
         		onOffline();
         	}
        });
    },

    fail: function(error){
    	onOffline();
        //console.log("error Code = " + error.code);
        //console.log("upload error source: " + error.source);
        //console.log("upload error target: " + error.target);
    },

    addImageOverlay:function(ev){
        ev.preventDefault();
        if (!this.events_active) return;
        else this.events_active = false;
        
        var self = this;
        this.imageOverlay = new SelectImageOverlayView({
        	image_callback: function (imageURI){
        		$("#profile_image").attr('src', imageURI);
        		self.new_image_uri = imageURI;
        		self.scroll_refresh();
        		self.events_active = true;
        	},
        	cancel_callback: function () {
        		self.events_active = true;
        	},
        });
        
        // hide keyboard, but remember if it was hidden
        onKBShow();
        var $overlay = $("#overlay");
        $overlay.html(this.imageOverlay.render().el);
        $overlay.slideDown(300, function(){
        	self.imageOverlay.is_active = true;
        });
    }
});

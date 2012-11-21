var ProfileEditView = Backbone.View.extend({
   
    initialize: function(){
        _.bindAll(this, "win");
    },
    
    new_image_uri: '',
    
    events: {
      "click #image_input": "addImageOverlay",	
      "submit #user_edit_form": "updateUser",
      "load #profile_image": "image_load",
    },
    
    image_load: function() {
    	alert("image load");
    },

    render: function() {
    	var context = this.model.toJSON();
    	if (context.profile.full_name == null) context.profile.full_name = '';
        this.$el.html(this.template(this.model.toJSON()));
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
        var self = this;
        this.imageOverlay = new SelectImageOverlayView({
        	image_callback: function (imageURI){
        		$("#profile_imßage").attr('src', imageURI);
        		self.new_image_uri = imageURI;
        		
        		/*
        		setTimeout(function(){
        			self.scroller.refresh();
        			console.lgo("scroller refresh");
        		}, 300);
        		*/
        	}
        });
        $("#overlay").html(this.imageOverlay.render().el);
        this.eventAggregator.trigger("footer:hide");
        $("#overlay").slideDown("normal", function(){
        	self.imageOverlay.is_active = true;
        });
    }
});

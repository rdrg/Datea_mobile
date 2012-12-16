var SelectImageOverlayView = Backbone.View.extend({

    initialize: function(){
        _.bindAll(this);
        var self = this;
        window.backbutton_func = function() {
        	if (self.options.cancel_callback) self.options.cancel_callback();
        	self.hideOverlay();
        }
    },

    events: {
        "tap #capture_image": "captureImage",
        "tap #album_image" : "browseImage",
        "tap #cancel" : "cancel",
    },
    
    is_active: false,

    render: function(){
        this.$el.html(this.template());
        return this;
    },

    captureImage: function(event){
    	event.preventDefault();
    	
    	if (this.is_active) this.is_active = false;
    	else return;
    	
        var self = this;
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
               self.hideOverlay();
               self.options.image_callback(imageURI);
            },
            function(message){
            	notify_alert('Error', message);
               	self.hideOverlay();
            },
            {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                correctOrientation: true,
            }
        );
     },

     browseImage: function(event){
     	event.preventDefault();
    	
    	if (this.is_active) this.is_active = false;
    	else return;
     	
        var self = this;
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
            	self.hideOverlay();
                self.options.image_callback(imageURI);
            },
            function(message){
            	notify_alert('Error', message);
                self.hideOverlay();
            },
            {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
            }
        );
    },
    
    cancel:function(ev){
        ev.preventDefault();
    	if (this.is_active) this.is_active = false;
    	else return;
        this.hideOverlay();
        if (this.options.cancel_callback) this.options.cancel_callback();
    },

    hideOverlay: function(){
    	var self = this;
        $("#overlay").slideUp("fast", function() {
        	self.close();
        	setTimeout(function(){
        		onKBHide();
        	}, 150);
        });
    }
});

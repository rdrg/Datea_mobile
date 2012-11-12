var ProfileImageOverlayView = Backbone.View.extend({

    initialize: function(){
        _.bindAll(this);
    },

    events: {
        "click #capture_image": "captureImage",
        "click #album_image" : "browseImage",
        "click #cancel" : "cancel"
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
    	
        this.hideOverlay();
        var self = this;
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
               self.options.image_callback(imageURI);
            },
            function(message){
                alert(message);
            },
            {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI
                //sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                //destinationType: navigator.camera.DestinationType.DATA_URL,
                //sourceType: navigator.camera.PictureSourceType.CAMERA
                //sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
            }
        );
     },

     browseImage: function(event){
     	event.preventDefault();
    	
    	if (this.is_active) this.is_active = false;
    	else return;
     	
        this.hideOverlay();
        var self = this;
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
                //var images = [];
                //images.push(imageURI);
                //$("#image_data").val(imageURI);
                //self.model.set({
                  //  images: images
                //});
                self.options.image_callback(imageURI);
              // self.imageURI = imageURI;
            },
            function(message){
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
     },
     cancel:function(){
        event.preventDefault();
    	if (this.is_active) this.is_active = false;
    	else return;
        this.hideOverlay();
    },

    hideOverlay: function(){
        $("#overlay").hide("fast");
    }
});

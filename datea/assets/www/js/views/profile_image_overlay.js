var ProfileImageOverlayView = Backbone.View.extend({

    initialize: function(){
        _.bindAll(this);
    },

    events: {
        "click #capture_image": "captureImage",
        "click #album_image" : "browseImage",
        "click #cancel" : "cancel"
    },

    render: function(){
        this.$el.html(this.template());
        return this;
    },

    captureImage: function(event){
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
               // self.imageURI = imageURI;
               $("#profile_image").attr('src', imageURI);
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
                $("#profile_image").attr('src', imageURI);
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
        console.log("canceling");
        this.hideOverlay();
    },

    hideOverlay: function(){
        $("#overlay").hide("fast");
    }
});
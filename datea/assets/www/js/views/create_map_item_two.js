var CreateMapItemTwo = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this);
        //console.log("this is step: " + this.options.step);
        this.context = Object();
        this.context.step = this.options.step;
    },
    
    events: {
        "click #image_input": "addImageOverlay",
        "change #description": "setDescription"
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    },

     browseImage: function(event){
        var self = this;
        event.preventDefault();
        navigator.camera.getPicture(
            function(imageURI){
                var images = [];
                images.push(imageURI);
                //$("#image_data").val(imageURI);
                self.model.set({
                    images: images
                });
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

     setDescription: function(){
        //console.log("description changed");
        this.model.set({
            content: $('input[type="text"]').val() 
        });
     },

    addImageOverlay: function(event){
        event.preventDefault();
        this.imageOverlay = new ImageOverlayView({model: this.model});
        $("#overlay").html(this.imageOverlay.render().el);
        this.eventAggregator.trigger("footer:hide");
        $("#overlay").show("fast");
    },
});

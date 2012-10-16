var CreateMapItemView = Backbone.View.extend({

    initialize: function(){
        
        var self = this;
       
        if(this.options.mappingModel.get('item_categories') !== undefined){
            console.log('setting step to 1');
            this.step = 1;
        }else{
            console.log('setting step to 2');
            this.step = 2;
        }
        //if this.model.attributes.
        _.bindAll(this, 'nextView');

    },
    events: {
        "click #next_button": "render"
    },

    render: function(){
        this.$el.html(this.template());
        this.nextView();
        return this;
    },

    nextView: function(){
        console.log("next view");

        if(this.step == 1){
            console.log("perform actions for step 1");
            this.stepOneView = new CreateMapItemOne({
                model: this.model,
                mappingModel: this.options.mappingModel, 
                step : this.step
            });
            console.log("mapping url: " + this.model.get('action'));
            this.$("#create_mapitem_content").html(this.stepOneView.render().el); 
            this.step = 2;

        }else if(this.step == 2){
            console.log("perform actions for step 2");
               this.stepTwoView = new CreateMapItemTwo({
                model: this.model,
                mappingModel: this.options.mappingModel,
                step : this.step
            });
            this.$("#create_mapitem_content").html(this.stepTwoView.render().el); 
            this.step = 3;

        }else if(this.step == 3){
            console.log("perform actions for step 3");
            /*
            this.stepThreeView = new CreateMapItemThree({
                model: this.model,
                mappingModel: this.options.mappingModel,
                step : this.step
            });
            this.$("#create_mapitem_content").html(this.stepThreeView.render().el);
            */
            this.locationView = new LocationInputView({
                model: this.model,
                mapModel: this.options.mappingModel,
                step: this.step,
                modelField: 'position'
            });
            this.$("#create_mapitem_content").html(this.locationView.render().el);
            this.locationView.loadMap();
            this.step = 4;
        }else if(this.step == 4){
            this.transferImage();
        }
    },

     transferImage: function(){
            //event.preventDefault();
            console.log("sending image");
            var self = this;
            
            var transfer = new FileTransfer();
            var options = new FileUploadOptions();
            var images = this.model.get('images');
            var image_uri = images[0];
            //options.fileKey = "file";
            options.mimeType = "image/jpeg";
            options.fileName = image_uri.substr(image_uri.lastIndexOf('/')+1);
            options.fileKey = 'image';
            options.chunkedMode = false;
            
            params = new Object();

            /*
            params.object_type = 'DateaProfile';
            params.object_id = this.model.get('profile').id;
            params.object_field = 'image';
            params.thumb_preset = 'profile_image_large';
            */
            //params.object_field = 'image';
            params.headers = { 
                'Authorization': 'ApiKey '+ window.localUser.username + ':' + window.localUser.token, 
                'enctype': 'multipart/form-data'
            };
            options.params = params;

            //if(localStorage.getItem("authdata")) {
                //var authdata = JSON.parse(localStorage.getItem("authdata"));
                        
            //var im = $("#image_path").text();
            console.log("image: " + image_uri);    
                            
            transfer.upload(image_uri, encodeURI(api_url + "/image/api_save/"), self.win(self), self.fail(self), options);

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
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    //sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                    //destinationType: navigator.camera.DestinationType.DATA_URL,
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
        }

});

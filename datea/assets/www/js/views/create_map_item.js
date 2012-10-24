var CreateMapItemView = Backbone.View.extend({

    initialize: function(){
        
        var self = this;
        
        this.step = 1;    
        _.bindAll(this);

    },
    events: {
        "click #next_button": "stepForward",
        "click #back_button": "stepBackward"       
    },

    render: function(){
        var context = {};
        context.step = this.step;
        this.$el.html(this.template(context));
        this.nextView();
        return this;
    },

    stepForward: function(){
        
        //this is a foo change
        if(this.step == 1){
            /*
            this.selectCategory();
            this.setDescription();
            if(!this.model.get('category') || !this.model.get('content')){
                alert("Se requiere seleccionar una categoria y escribir una descripcion");
                return;
            }
            */
            var tmp_cat_id =  $('[name="category"]:checked', this.$el).val();
            var tmp_desc = $('textarea').val();
            
            if(!tmp_cat_id || !tmp_desc){
                alert("Se requiere seleccionar una categoria y escribir una descripcion");
                return;
            }else{
                this.selectCategory();
                this.setDescription(); 
            }

        }

        if(this.step < 4){
            this.step = this.step + 1;
            this.render();
        }else{
            this.step = this.step;
        }
    },

    stepBackward: function(){
        if(this.step > 0 ){
            this.step = this.step - 1;
            this.render();
        }else{
            this.step = 1;
        }
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
            //this.step = 2;
        /*
        }else if(this.step == 2){
            console.log("perform actions for step 2");
               this.stepTwoView = new CreateMapItemTwo({
                model: this.model,
                mappingModel: this.options.mappingModel,
                step : this.step
            });
            this.$("#create_mapitem_content").html(this.stepTwoView.render().el); 
            this.step = 3;
        */
        }else if(this.step == 2){
            console.log("perform actions for step 3");
            
            this.locationView = new LocationInputView({
                model: this.model,
                mapModel: this.options.mappingModel,
                step: this.step,
                modelField: 'position'
            });

            //$("#main").html(this.locationView.render().el);
            this.$("#create_mapitem_content").html(this.locationView.render().el); 
            this.locationView.loadMap();

            this.eventAggregator.trigger("footer:hide");

            //this.step = 3;
        }else if(this.step == 3){
            //this.step = 4;
            this.stepThreeView = new CreateMapItemThree({
                model: this.model,
                mappingModel: this.options.mappingModel,
                step: this.step
            });

            $("#create_mapitem_content").html(this.stepThreeView.render().el);
            //this.transferImage();
        }else if(this.step == 4){
            this.transferImage();
        }
    },

     transferImage: function(){
            //event.preventDefault();
            console.log("sending image");
            var self = this;
            
            if(this.model.get('images') !== undefined){            
                var transfer = new FileTransfer();
                var options = new FileUploadOptions();
                var images = this.model.get('images');
                var image_uri = images[0];
                //options.fileKey = "file";
                options.mimeType = "image/jpeg";
                options.fileName = image_uri.substr(image_uri.lastIndexOf('/')+1);
                options.fileKey = 'image';
                options.chunkedMode = false;
                options.user = localUser;
                
                params = new Object();

                //params.object_field = 'image';
                params.thumb_preset = 'profile_image_large';
                console.log("user: " + localSession.get('username') + "key: " + localSession.get('token'));
                params.headers = { 
                    'Authorization': 'ApiKey '+ localSession.get('username') + ':' + localSession.get('token'), 
                    'enctype': 'multipart/form-data'
                };
                options.params = params;
                console.log("image: " + image_uri);    
                transfer.upload(image_uri, encodeURI(api_url + "/image/api_save/"), self.win, self.fail, options);

            }else{
               this.saveMapItem();
            }
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
            var jres = JSON.parse(r.response);
            console.log("response: " + JSON.stringify(jres.resource));
            var im = jres.resource;
            var self = this;
            this.model.set({image: im});
            this.saveMapItem();
        },

        fail: function(error){
            console.log("error Code = " + error.code);
            console.log("upload error source: " + error.source);
            console.log("upload error target: " + error.target);
        },

        saveMapItem: function(){
            var self = this;
            var count = this.options.mappingModel.get('item_count');
            count++; 
            var mapItems = this.options.mappingModel.get('map_items');
            mapItems.push(this.model);
            this.options.mappingModel.set({
                map_tems: mapItems,
                item_count: count
            }); 
            this.model.save({}, {
                success: function(){
                	 /*
                     self.options.mappingModel.save({
                        success: function(){
                            console.log('mapping model saved');
                        },
                        error: function(){
                            alert('Error de conexión. Revisa tu conexión e intenta nuevamente.');
                        }
                    });
                   console.log("saved");
                   */
                    if (self.options.mappingModel.attributes.map_items) {
                    	self.options.mappingModel.attributes.map_items.unshift(self.model.toJSON());	
                    }else{
                    	self.options.mappingModel.set('map_items',[self.model.toJSON()],{silent: true});
                    }
                 
                    self.options.mappingModel.set({
                    	item_count: self.options.mappingModel.get('item_count') + 1
                    });
                    self.stepFourView = new CreateMapItemFour({
                        model : self.model,
                        mappingModel : self.options.mappingModel
                    });
                    self.$("#create_mapitem_content").html(self.stepFourView.render().el);
                },
                error: function(){
                    alert('Error de conexión. Revisa tu conexión e intenta nuevamente.');
                }
            });          
        },

         selectCategory: function(){
            //console.log("category clicked");
            var cat_id = $('[name="category"]:checked', this.$el).val();
            var cat = null;
            var categories = this.options.mappingModel.get('item_categories');
            cat = _.find(categories, function(c){return c.id == cat_id;});
            this.model.set({
                category: cat,
                category_id: cat.id,
                category_name: cat.name,
                color: cat.color
            },{silent: true});
            console.log("cat val: " + cat);
        },

         setDescription: function(){
            console.log("description changed: " + $('textarea').val());

            this.model.set({
                content: $('textarea').val() 
            });
         }
       
});

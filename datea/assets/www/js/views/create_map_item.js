var CreateMapItemView = Backbone.View.extend({

    initialize: function(){
        
        var self = this;
        
        this.step = 1;    
        _.bindAll(this);
        var cats = this.options.mappingModel.get('item_categories');
        this.has_categories = cats.length > 0;

    },
    
    events: {
        "click #next_button": "stepForward",
        "click #back_button": "stepBackward",     
    },

    events_active: true,

    render: function(){
        var context = {};
        context.step = this.step;
        this.$el.html(this.template(context));
        this.nextView();
        var self = this;
    	setTimeout(function(){
    		self.events_active = true;
    	}, 300);
        return this;
    },

    stepForward: function(ev){
    	ev.preventDefault();
    	if (this.events_active) this.events_active = false;
    	else return;
        
        if(this.step == 1){
            if (this.has_categories) {
           		var tmp_cat_id =  $('[name="category"]:checked', this.$el).val();
           		var tmp_desc = $('textarea').val();
           		if(!tmp_cat_id || !tmp_desc){
           			alert("Los campos de categoria y descripción son obligatorios.");
           			this.events_active = true;
                	return;
                }
                this.selectCategory();
           	}else{
           		var tmp_desc = $('textarea').val();
           		if(!tmp_desc){
           			alert("El campo de descripción es obligatorio.");
           			this.events_active = true;
                	return;
                }
           	}
            this.setDescription(); 
        }
		
		this.step++;
		if (this.step < 4) {
			this.render();
		}else{
			this.nextView();
		}
    },

    stepBackward: function(){
    	
    	if (this.events_active) this.events_active = false;
    	else return;
    	
        if(this.step > 0 ){
            this.step = this.step - 1;
            this.render();
        }else{
            this.step = 1;
        }
    },

    nextView: function(){
        //console.log("next view");
		
		// skew layout for map
		if (this.step == 2) {
			this.$el.css('bottom', '0');
		}else{
			this.$el.css('bottom', 'auto');
		}
		
        if(this.step == 1){
            this.stepOneView = new CreateMapItemOne({
                model: this.model,
                mappingModel: this.options.mappingModel, 
                step : this.step,
                parent_view: this,
            });
            this.$el.find("#create_mapitem_content").html(this.stepOneView.render().el); 

        }else if(this.step == 2){
            
            this.locationView = new LocationInputView({
                model: this.model,
                mapModel: this.options.mappingModel,
                step: this.step,
                modelField: 'position',
                mapCenter: this.options.mappingModel.get('center'),
                mapBoundary: this.options.mappingModel.get('boundary')
            });
            this.$el.find("#create_mapitem_content").html(this.locationView.render().el); 
            this.locationView.loadMap();

            //this.step = 3;
        }else if(this.step == 3){
            //this.step = 4;
            this.stepThreeView = new CreateMapItemThree({
                model: this.model,
                mappingModel: this.options.mappingModel,
                step: this.step,
                parent_view: this,
            });

            this.$el.find("#create_mapitem_content").html(this.stepThreeView.render().el);
            //this.transferImage();
        }else if(this.step == 4){
      		this.$el.find("#create_mapitem_content").html('');
            this.transferImage();
        }
        
        //if (this.step !=2) this.scroll_refresh();
    },

     transferImage: function(){
            //event.preventDefault();

            var self = this;
            $('#spinner').fadeIn("fast");
            if(this.imageURI !== undefined){            
                var transfer = new FileTransfer();
                var options = new FileUploadOptions();
                //options.fileKey = "file";
                options.mimeType = "image/jpeg";
                options.fileName = this.imageURI.substr(this.imageURI.lastIndexOf('/')+1);
                options.fileKey = 'image';
                options.chunkedMode = false;
                options.user = localUser;
                
                params = new Object();

                //params.object_field = 'image';
                params.thumb_preset = 'profile_image_large';
                //console.log("user: " + localSession.get('username') + "key: " + localSession.get('token'));
                params.headers = { 
                    'Authorization': 'ApiKey '+ localSession.get('username') + ':' + localSession.get('token'), 
                    'enctype': 'multipart/form-data'
                };
                options.params = params;  
                transfer.upload(this.imageURI, encodeURI(api_url + "/image/api_save/"), self.win, self.fail, options);

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

            //console.log("Code = " + r.responseCode);
            //console.log("Response= " + r.response);
            //console.log("Sent = " + r.bytesSent);
            var jres = JSON.parse(r.response);
            //console.log("response: " + JSON.stringify(jres.resource));
            var im = jres.resource;
            this.model.set({images: [im]});
            this.saveMapItem();
        },

        fail: function(error){
            //console.log("error Code = " + error.code);
            //console.log("upload error source: "+ error.source);
            //console.log("upload error target: " + error.target);
            onOffline();
            this.step = 3;
            this.render();
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
                	//console.log('map item after save: '+JSON.stringify(self.model.toJSON()));
                	 
                    if (self.options.mappingModel.attributes.map_items) {
                    	self.options.mappingModel.attributes.map_items.unshift(self.model.toJSON());	
                    }else{
                    	self.options.mappingModel.set('map_items',[self.model.toJSON()],{silent: true});
                    }
                 
                    self.options.mappingModel.set({
                    	item_count: self.options.mappingModel.get('item_count') + 1
                    });
                    
                    var context = {step: 4};
        			self.$el.html(self.template(context));
        			self.events_active = true;
                    
                    self.stepFourView = new CreateMapItemFour({
                        model : self.model,
                        mappingModel : self.options.mappingModel
                    });
                    self.$("#create_mapitem_content").html(self.stepFourView.render().el);
                },
                error: function(error){
                	//console.log(JSON.stringify(error));
                    alert('Error de conexión. Revisa tu conexión e intenta nuevamente.');
		            this.step = 3;
		            this.render();
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
            //console.log("cat val: " + cat);
        },

         setDescription: function(){

            this.model.set({
                content: $('textarea').val() 
            });
         }
       
});

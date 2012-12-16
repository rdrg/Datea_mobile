var CreateMapItemOne = Backbone.View.extend({

    initialize: function(){
        //var self = this;
        var acc = this.model.get('action');
        //console.log("item action: " + JSON.stringify(acc));
        var cats = [];
        var cat_options = [{value: '', label: '-- seleccionar --'}];
        _.each(this.options.mappingModel.get('item_categories'), function(cat){
            //console.log("category: " + JSON.stringify(cat));
            cat_options.push({value: cat.id, label: cat.name, color: cat.color});
        });
        
        this.context = this.model.toJSON();
        this.context.has_categories = cat_options.length > 1;
        this.context.cat_options = cat_options;
        this.context.step = this.options.step;
        this.context.description = this.options.content;
        if (this.options.parent_view.imageURI) this.context.imageURI = this.options.parent_view.imageURI;
        _.bindAll(this);
        //console.log("this is step: " + this.context.step);
        
        var self = this;
    },
    
    events: {
        "change #description": "setDescription",
        "tap #image_input": "addImageOverlay"
    },

    render: function(){
        this.$el.html(this.template(this.context));
        if (this.context.has_categories) {
        	
        	var options = {};
        	_.each(this.context.categories)
        	
        	var self = this;
        	var selectBoxView = new CustomSelectBoxView({
        		options: this.context.cat_options,
        		value: this.context.category_id,
        		open_callback: function() {
        			$('textarea', self.$el).attr('disabled', true);
        		},
        		select_callback: function(value){
        			var cat_id = parseInt(value);
        			var cat = null;
			        var categories = self.options.mappingModel.get('item_categories');
			        cat = _.find(categories, function(c) {return c.id == cat_id;});
			        self.model.set({
			            category: cat,
			            category_id: cat.id,
			            category_name: cat.name,
			            color: cat.color
			        },{silent: true});
			        setTimeout(function(){
			        	$('textarea', self.$el).removeAttr('disabled');
			        }, 0);
			        self.options.parent_view.scroll_refresh();
			        // if there's user input, override back function
			        window.backbutton_func = function () {
			        	notify_confirm(
			        		'Alerta', 
			        		'Al regresar pierdes los datos que ingresaste. Quieres proseguir?',
			        		function () {
			        			window.history.back();	
			        		});	
			        }
        		},
        		cancel_callback: function () {
        			setTimeout(function(){
			        	$('textarea', self.$el).removeAttr('disabled');
			        }, 0);
        		}
        	});
        	$('.select-box-view', this.$el).html(selectBoxView.render().el);
        }
        return this;
    },

    setDescription: function(){
        //console.log("description changed: " + $('textarea').val());

        this.model.set({
            content: $('textarea').val() 
        });
        // if there's user input, override back function
        window.backbutton_func = function () {
        	notify_confirm(
        		'Alerta', 
        		'Al regresar pierdes los datos que ingresaste. Quieres proseguir?',
        		function () {
        			window.history.back();	
        		});	
        }
     },

    addImageOverlay: function(event){
        event.preventDefault();
        
        var self = this;
        this.imageOverlay = new SelectImageOverlayView({
        	image_callback: function(imageURI) {
        		self.options.parent_view.imageURI = imageURI;
        		$('#dateo-img-preview', self.$el).attr('src', imageURI);
        		self.options.parent_view.scroll_refresh();
        	}, 
        });
        
        // hide footer menu, but remember if it was hidden
        onKBShow();
        var $overlay = $('#overlay');
        $overlay.html(this.imageOverlay.render().el);
        $overlay.slideDown(300, function(){
        	self.imageOverlay.is_active = true;
        });
    },
	
});

var CreateMapItemOne = Backbone.View.extend({

    initialize: function(){
        //var self = this;
        var acc = this.model.get('action');
        //console.log("item action: " + JSON.stringify(acc));
        var cats = [];
        _.each(this.options.mappingModel.get('item_categories'), function(cat){
            //console.log("category: " + JSON.stringify(cat));
            cats.push(cat);
        });

        this.context = this.model.toJSON();
        this.context.has_categories = cats.length > 0;
        this.context.categories = cats;
        this.context.step = this.options.step;
        this.context.description = this.context.content;
        if (this.options.parent_view.imageURI) this.context.imageURI = this.options.parent_view.imageURI;
        _.bindAll(this);
        //console.log("this is step: " + this.context.step);
    },
    
    events_active: true,

    events: {
        "click #image_input": "addImageOverlay",
        "change #description": "setDescription",
        "click input[type=radio]": "selectCategory",
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    },

    selectCategory: function(){
        //console.log("category clicked");
        $('label.radio', this.$el).removeClass('active');
        var $radio = $('[name="category"]:checked', this.$el);
        var cat_id = $radio.val();
        $radio.closest('label.radio').addClass('active');
        
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
        //console.log("description changed: " + $('textarea').val());

        this.model.set({
            content: $('textarea').val() 
        });
     },

    addImageOverlay: function(event){
        event.preventDefault();
        var self = this;
        this.imageOverlay = new SelectImageOverlayView({
        	image_callback: function(imageURI) {
        		self.options.parent_view.imageURI = imageURI;
        		$('#dateo-img-preview', self.$el).attr('src', imageURI);
        	}
        });
        
        // hide footer menu, but remember if it was hidden
        onKBShow();
        $("#overlay").html(this.imageOverlay.render().el);
        $("#overlay").slideDown(300, function(){
        	self.imageOverlay.is_active = true;
        });
    },
	
});

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
        this.context.has_categories = true;
        this.context.categories = cats;
        this.context.step = this.options.step;
        this.context.description = this.context.content; 
        _.bindAll(this);
        //console.log("this is step: " + this.context.step);
    },
    
    events_active: true,

    events: {
        "click #image_input": "addImageOverlay",
        "change #description": "setDescription",
        "click input[type=radio]": "selectCategory",
        "focus #description" : "typing"
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
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
        console.log("description changed: " + $('textarea').val());

        this.model.set({
            content: $('textarea').val() 
        });
     },

    addImageOverlay: function(event){
        event.preventDefault();
        var self = this;
        this.imageOverlay = new SelectImageOverlayView({
        	image_callback: function(imageURI) {
        		self.model.set({ images: [imageURI] });
        	}
        });
        $("#overlay").html(this.imageOverlay.render().el);
        this.eventAggregator.trigger("footer:hide");
        $("#overlay").slideDown("normal", function(){
        	self.imageOverlay.is_active = true;
        });
    },

    typing: function(event){
        this.eventAggregator.trigger("footer:hide");
        $("#description").autosize();
    }
});

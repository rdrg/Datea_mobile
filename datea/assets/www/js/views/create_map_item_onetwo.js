var CreateMapItemOneTwo = Backbone.View.extend({

    initialize: function(){
        //var self = this;
        var acc = this.model.get('action');
        console.log("item action: " + JSON.stringify(acc));
        var cats = [];
        _.each(this.options.mappingModel.get('item_categories'), function(cat){
            console.log("category: " + JSON.stringify(cat));
            cats.push(cat);
        });

        this.context = this.model.toJSON();
        this.context.has_categories = true;
        this.context.categories = cats;
        this.context.step = this.options.step;
        _.bindAll(this);
        //console.log("this is step: " + this.context.step);
    },

    events: {
        "click #image_input": "addImageOverlay",
        "change #description": "setDescription",
        "click :input[type=radio]": "selectCategory"
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    },

    selectCategory: function(){
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
     },

    addImageOverlay: function(event){
        event.preventDefault();
        this.imageOverlay = new ImageOverlayView({model: this.model});
        $("#overlay").html(this.imageOverlay.render().el);
        $("#footer").hide("fast");
        $("#overlay").show("fast");
    }
});

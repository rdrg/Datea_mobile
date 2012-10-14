var CreateMapItemOne = Backbone.View.extend({

    initialize: function(){
        var self = this;
        var acc = this.model.get('action');
        var cats = [];
        _.each(this.options.mappingModel.get('item_categories'), function(cat){
            console.log("category: " + JSON.stringify(cat));
            cats.push(cat);
        });

        this.context = this.model.toJSON();
        this.context.has_categories = true;
        this.context.categories = cats;
        _.bindAll(this, 'render');
    },

    events: {
        "click :input[type=radio]": "selectCategory"
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    },

    selectCategory: function(){
        var cat = $('[name="category"]:checked', this.$el).val();
        console.log("cat val: " + cat);
    }
});

var CreateMapItemOne = Backbone.View.extend({

    initialize: function(){
        var self = this;
        var acc = this.model.get('action');
        console.log("action url: " + acc);
        /*
        this.mappingModel = new Action();
        this.mappingModel.url =  api_url + this.model.get('action');
        this.mappingModel.fetch({
            success: function(model){
                console.log("mapping model: " + JSON.stringify(model.toJSON()));
            }
        });
        */
        console.log(JSON.stringify(this.options.mappingModel.toJSON));
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

    render: function(){
        console.log("context: " + this.context);
        this.$el.html(this.template(this.context));
        return this;
    }
});

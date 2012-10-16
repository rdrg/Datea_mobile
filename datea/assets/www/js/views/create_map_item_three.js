var CreateMapItemThree = Backbone.View.extend({
    initialize: function(){
        /*
        _.each(this.model.get('images'), function(img){
             console.log('images uri ' + img);
        });
        */
         console.log("this is step: " + this.options.step);
         this.context = this.model.toJSON;
         this.context.step = this.options.step;
    },

    render: function(){
        this.$el.html(this.template());
        return this;
    }
});

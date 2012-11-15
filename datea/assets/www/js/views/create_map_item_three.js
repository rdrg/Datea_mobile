var CreateMapItemThree = Backbone.View.extend({
    initialize: function(){
        /*
        _.each(this.model.get('images'), function(img){
             console.log('images uri ' + img);
        });
        */
         console.log("this is step: " + this.options.step);
         this.context = this.model.toJSON();
         console.log("dateo model: " + JSON.stringify(this.context));
         this.context.step = this.options.step;
         if (this.options.parent_view.imageURI) this.context.imageURI = this.options.parent_view.imageURI;
         this.context.content = this.context.content.replace(/\n/g, '<br />');
         _.bindAll(this);
    },

    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    }
});

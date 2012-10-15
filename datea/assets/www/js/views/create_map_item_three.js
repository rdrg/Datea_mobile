var CreateMapItemThree = Backbone.View.extend({
    initialize: function(){
        _.each(this.model.get('images'), function(img){
             console.log('images uri ' + img);
        });
    },

    render: function(){
        this.$el.html(this.template());
        return this;
    }
});

var ActionView = Backbone.View.extend({
    render: function(){
        var mdl = this.model.toJSON();
        //console.log("model: " + JSON.stringify(mdl));
        
        if(!mdl.name){
            //mdl['api_url'] = api_url;
            return this;
        }
        this.$el.html(this.template(mdl));
        return this;
    }
});

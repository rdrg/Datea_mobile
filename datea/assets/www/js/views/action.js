var ActionView = Backbone.View.extend({
    render: function(){
        var mdl = this.model.toJSON();
        //console.log("model: " + JSON.stringify(mdl));
        if(!mdl.name){
            console.log("model dont exists");
            return this;
        }
        this.$el.html(this.template(mdl));
        return this;
    }
});

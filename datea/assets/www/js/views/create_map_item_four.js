var CreateMapItemFour = Backbone.View.extend({
    initialize: function(){
        var self = this;
        this.step = this.options.step;
        this.context = {
            mapid: self.options.mappingModel.get('id'),
            reportid: self.model.get('id')
        };
        _.bindAll(this, "render");
    },
    render: function(){
        this.$el.html(this.template(this.context));
        return this;
    }
});

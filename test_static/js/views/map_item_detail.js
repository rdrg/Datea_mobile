var ItemDetailView = Backbone.View.extend({
    render: function(){
        console.log("item detail: " + JSON.stringify(this.model.toJSON()));
        this.$el.html(ich.item_detail_tpl(this.model.toJSON()));
        return this;
    }
});

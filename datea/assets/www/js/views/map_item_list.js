var MapItemListView = Backbone.View.extend({
    render: function(){
        var map_item_list = [];
        _.each(this.model.models, function(item){
            map_item_list.push(item.toJSON());
        });
        //console.log(JSON.stringify(this.model.toJSON()));
        var map_items = {'map_items': map_item_list};
        this.$el.html(this.template(map_items));
        return this;
    }
});

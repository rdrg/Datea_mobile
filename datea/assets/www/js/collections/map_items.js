var MapItemCollection = Backbone.Collection.extend({
        url: "/api/v1/map_item/",
        model: MapItem
});

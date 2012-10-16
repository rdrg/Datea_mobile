var MapItemResponseCollection = Backbone.Collection.extend({
        url: "/api/v1/map_item_response/",
        model: MapItemResponse
});
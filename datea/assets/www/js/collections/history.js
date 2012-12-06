var HistoryCollection = Backbone.Collection.extend({
    model: HistoryModel,
    url: api_url +'/api/v1/history/'
});
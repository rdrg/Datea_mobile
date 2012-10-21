var HistoryCollection = Backbone.Collection.extend({
    model: HistoryModel,
    url: '/api/v1/history/'
});
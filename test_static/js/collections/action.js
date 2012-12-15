var ActionCollection = Backbone.Collection.extend({
    model: Action,
    url: api_url + '/api/v1/action/'
});

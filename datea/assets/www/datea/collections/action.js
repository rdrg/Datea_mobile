var ActionCollection = Backbone.Collection.extend({
    model: Action,
    url: '/api/v1/action/'
});

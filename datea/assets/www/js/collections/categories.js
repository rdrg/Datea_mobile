var CategoryCollection = Backbone.Collection.extend({
    model: Category,
    url: api_url + '/api/v1/category/'
});

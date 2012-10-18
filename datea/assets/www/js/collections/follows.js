var FollowCollection = Backbone.Collection.extend({
    model: Comment,
    url: '/api/v1/comment/'
});
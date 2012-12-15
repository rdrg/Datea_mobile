var Session = Backbone.Model.extend({
    urlRoot: "/api/v1/accounts/signin/",
    defaults: {
        logged: false,
        token: null,
        username: null,
        userid: null
    }
});

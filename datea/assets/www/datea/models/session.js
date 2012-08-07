//SESSION MODEL

var Session = Backbone.Model.extend({
    urlRoot: "/api/v1/accounts/signin/",
    defaults: {
        logged: false,
        apiKey: null,
        username: null,
        //password: null,
        userid: null
    }
});


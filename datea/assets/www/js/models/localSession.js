window.localSession = Backbone.Model.extend({
    defaults:{
        "username":null,
        "token": null,
        "userid": null,
        "logged": false
    }
});
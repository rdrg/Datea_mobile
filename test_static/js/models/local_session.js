var localSession = Backbone.Model.extend({
    //localStorage: new Backbone.LocalStorage("localmodel"),

    defaults:{
        "username":null,
        "token": null,
        "userid": null,
        "logged": false
    }

});

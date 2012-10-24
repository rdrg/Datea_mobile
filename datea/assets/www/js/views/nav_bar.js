//This is the Backbone controller that manages the Nav Bar


var NavBarView = Backbone.View.extend({
/*
    initialize:function(options){


        Backbone.history.on('route',function(){
            //this.render(path);
            console.log(Backbone.history.getFragment());
            //console.log("source: " + source);
        }, this);
    },
    */
    //This is a collection of possible routes and their accompanying
    //user-friendly titles
    /*
    titles: {
        "":"Home",
        "adventure":"Adventure",
        "contact":"Contact"
    },
    */
    /*
    events:{
        'click a':function(source) {
            var hrefRslt = source.target.getAttribute('href');
            Backbone.history.navigate(hrefRslt, {trigger:true});
            //Cancel the regular event handling so that we won't actual change URLs
            //We are letting Backbone handle routing
            return false;
        }
    },
    */
    //Each time the routes change, we refresh the navigation
    //items.
    render:function(route){
       this.$el.empty();
       console.log("route: " + route);
       var mdl = this.model.toJSON();
       this.$el.html(this.template(mdl));
       return this;
    }
});

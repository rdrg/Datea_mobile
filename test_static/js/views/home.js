//HOME VIEW
var HomeView = Backbone.View.extend({

    render: function(){
        console.log(ich.templates);
        this.$el.html(ich.home_tpl());
        return this;
    }
});


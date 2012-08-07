//HOME VIEW
var HomeView = Backbone.View.extend({

    render: function(){
        this.$el.html(ich.home_tpl());
        return this;
    }
});


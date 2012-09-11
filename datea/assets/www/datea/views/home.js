//HOME VIEW
var HomeView = Backbone.View.extend({
    initialize: function(){
      console.log(tpl.templates);
      this.template = _.template(tpl.get('home'));    
    },

    render: function(){
        this.$el.html(this.template);
        return this;
    }
});


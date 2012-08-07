    //USER VIEW
var ProfileView = Backbone.View.extend({ 
    
    initialize: function(){
        this.model.bind("change", this.render, this);
    },

    render: function(){
        //evaluate the object is not empty
        
        this.dat = this.model.toJSON();
        this.$el.html(ich.user_profile_tpl(this.dat));
        return this;
    }
});


var ProfileView = Backbone.View.extend({
    
    initialize: function() {
        this.model.bind("change", this.render, this);
    },

    render: function() {
    	var mdl = this.model.toJSON();
    	console.log(mdl.profile.image);
    	
    	if (!mdl.username) {
    		return this;
    	}
    	
    	this.$el.html(this.template(mdl));
        return this;
    }
});
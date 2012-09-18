var ActionsView = Backbone.View.extend({
	initialize: function () {
        //fetch actions according to user status
	this.render();
    },	
    render: function () {
    	//alert('me llaman')
        var action_list = [];
    	//var self = this;
    	//var uids = this.model.models.slice()
        
    	//(function next() {
    		//if (!uids.length) return;
    		//var uid = uids.pop()
    	_.each(this.model.models, function (action) {
            action_list.push(action.toJSON());
        });
    	    //next();
    	//})();
        
        actions = {"actions": action_list };
        
        this.$el.html(this.template(actions));

        return this;
    }
});

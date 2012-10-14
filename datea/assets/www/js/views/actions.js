var ActionsView = Backbone.View.extend({
	initialize: function () {
        //fetch actions according to user status
	this.render();
    },	
    render: function () {
        var action_list = [];
	_.each(this.model.models, function (action) {
            action_list.push(action.toJSON());
        });
        var image_url = {'image_url': api_url};
        actions = {"actions": action_list };
        this.$el.html(this.template(actions));

        return this;
    }
});

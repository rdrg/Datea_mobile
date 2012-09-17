var ActionView = Backbone.View.extend({
    render: function(){
        
        /*
         * using this template to hold the list, 
         * and iterate in mustache
         */
        //convert all models to json and
        //populate the list
        var action_list = [];
        _.each(this.model.models, function(action){
            action_list.push(action.toJSON());
        });
        actions = {"actions":  action_list};
        this.$el.html(ich.action_list_tpl(actions));
        //console.log("actions: " + JSON.stringify(actions));
       
        /*
         * using a child view with tis own template,
         * to hold the list
         */
        /*
        this.$el.html(ich.action_list_tpl());
        var self = this; 
        var actions = this.model.models;
        _.each(actions, function(action){
            self.$el.append(new ActionListView({model: action}).render().el);
         });
         */
        return this;
    }
});

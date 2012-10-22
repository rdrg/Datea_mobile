var ActionsView = Backbone.View.extend({
    initialize: function () {
        
        this.user_model = this.options.user_model;
        this.model = new ActionCollection();
        this.model.bind("reset", this.reset_even, this);
        this.selected_mode = 'all_actions';
        this.items_per_page = 8;
        this.page = 0;
        
        //console.log("initialize actions");
    },

    render: function () {
        /*
        var action_list = [];
        //if (typeof(this.model) == 'undefined') return;
	   _.each(this.model.models, function (action) {
            action_list.push(action.toJSON());
        });
       */

        actions = {"actions": this.model.toJSON() };
        
        this.$el.html(this.template(actions));
        //this.build_filter_options();
        return this;
        
    },

     build_filter_options: function () {
    	
    	this.filter_options = [
    		{value: 'combined', name: 'vista combinada'},
    		{value: 'my_actions', name: 'iniciativas seguidas'},
    		{value: 'own_actions', name: 'mis iniciativas'},
    		{value: 'all_actions', name: 'todas las iniciativas'},
		];    		
    },

    fetch_models: function(){
        
        var params = {
            limit: this.items_per_page,
            offset: this.page * this.items_per_page,
            //following_user: this.user_model.get('id');
        };

        if(this.model.meta
                && this.model.total_count
                && params.limit + params.offset >= this.model.meta.total_count){
                    return;
                }

        switch(this.selected_mode){

            case 'my_actions':
                params.following_user = this.user_model.get('id');
                break;

    	    case 'own_actions':
                params.user_id = this.user_model.get('id');
                break;

            case 'featured_actions':
                params.featured = 1;
                break;
   
            case 'all_actions':
                break;                
        }

        var self = this;
        this.model.fetch({
            data: params,
            success: function(){
                console.log("models fetched")
                self.render();
            }
        });
    }
   
    /*
    events: {
        'click .action_detail' : 'clickDetail_handler' 
    },

    clickDetail_handler: function(event){
        console.log('click handler');
        window.stackNavigator.pushView(ActionView);
    }
    */
});

var ActionsView = Backbone.View.extend({
    initialize: function () {
        
        this.user_model = this.options.user_model;
        this.model.bind("reset", this.reset_even, this);
        //console.log("selected mode: " + this.options.selected_mode);
        this.selected_mode = this.options.selected_mode;
        this.items_per_page = 2;
        this.page = 0;
        _.bindAll(this); 
        //console.log("initialize actions");
    },

    events: {
        'click .load-more-results': 'loadMoreResults'
    },

    render: function () {

        actions = {"actions": this.model.toJSON() };
        //console.log(actions);
        
        this.$el.html(this.template(actions));
        //this.build_filter_options();
        return this;
        
    },
    /*
     build_filter_options: function () {
    	
    	this.filter_options = [
    		{value: 'combined', name: 'vista combinada'},
    		{value: 'my_actions', name: 'iniciativas seguidas'},
    		{value: 'own_actions', name: 'mis iniciativas'},
    		{value: 'all_actions', name: 'todas las iniciativas'},
		];    		
                

    },
*/
    fetch_models: function(){
        
        this.params = {
            limit: this.items_per_page,
            offset: this.page * this.items_per_page
            //following_user: this.user_model.get('id');
        };

         if(this.options.search_term !== undefined && this.options.search_term !== '-'){
            //console.log("search term: " + this.options.search_term); 
            this.params.q = this.options.search_term;  
        }

        if(this.options.category_filter !== undefined && this.options.category_filter !== '-'){
            //console.log("catefgory filter: " + this.options.category_filter);
            this.params.category_id = this.options.category_filter;
        }

        if(this.options.order_by !== undefined && this.options.order_by !== '-'){
            //console.log("order by: " + this.options.category_filter);
            if(this.options.order_by == "distance"){
                navigator.geolocation.getCurrentPosition(this.location_success, this.location_err);
            }
            this.params.order_by = this.options.order_by;
        }

        if(this.model.meta
                && this.model.total_count
                && this.params.limit + this.params.offset >= this.model.meta.total_count){
                    return;
                }
        
        switch(this.selected_mode){

            case 'my_actions':
                this.params.following_user = this.user_model.get('id');
                //console.log("my actions selected with user: " + this.params.following_user);
                break;

    	    case 'own_actions':
                this.params.user_id = this.user_model.get('id');
                break;

            case 'featured_actions':
                this.params.featured = 1;
                break;
   
            case 'all_actions':
                console.log("all actions selected");
                //this.params.all_actions = 1;
                break;                
        }

        var self = this;
        this.model.fetch({
            data: this.params,
            success: function(){
                console.log("models fetched at actions //////////////////////");
                   	
    	        var add_pager = false;
    	        if (self.model.meta.total_count > self.model.meta.limit + self.model.meta.offset) {
       		    add_pager = true; 
                   console.log("lets add a pager"); 
    	        }
        
                var $pager_button = self.$el.find('.item-pager');
		if (add_pager) {
			$pager_button.removeClass('hide');
		}else{
			$pager_button.addClass('hide');
		}

                self.render();
            }
        });
    },

    location_success: function(position){
        this.params.lat = position.coords.latitude;
        this.params.lng = position.coords.longitude;
        //this.params.order_by = 'distance';
    },

    location_err: function(error){
        alert("location not available");
        //falling back to created
        this.params.order_by = 'created';
    },

    loadMoreResults: function(ev) {
    	ev.preventDefault();
    	this.page++;
    	this.fetch_models();
		//$(document).scrollTop(0);
    }

});

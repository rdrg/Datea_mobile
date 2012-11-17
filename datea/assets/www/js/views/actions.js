var ActionsView = Backbone.View.extend({
    initialize: function () {
        
        this.user_model = this.options.user_model;
        this.model.bind("reset", this.reset_event, this);
        //console.log("selected mode: " + this.options.selected_mode);
        this.selected_mode = this.options.selected_mode;
        this.items_per_page = 3;
        this.page = 1;
        _.bindAll(this); 
    },

    events: {
        'click .load-more-results': 'loadMoreResults'
    },

    render: function () {
        
        this.$el.html(this.template());
        return this;
        
    },
    search_models: function(){
        this.params = {
            limit: this.items_per_page,
            offset: this.page * this.items_per_page,
            page : this.page
            //following_user: this.user_model.get('id');
        };

         if(this.options.search_term !== undefined && this.options.search_term !== '-'){
            console.log("search term: " + this.options.search_term); 
            this.params.q = this.options.search_term;  
        }

        if(this.options.category_filter !== undefined && this.options.category_filter !== '-'){
            console.log("catefgory filter: " + this.options.category_filter);
            this.params.category_id = this.options.category_filter;
        }
        if(this.model.meta
                && this.model.total_count
                && this.params.limit + this.params.offset >= this.model.meta.total_count){
                    return;
                }
       console.log("selected mode: " + this.selected_mode); 
        switch(this.selected_mode){

            case 'my_actions':
                this.params.following_user = this.user_model.get('id');
                console.log("my actions selected with user: " + this.params.following_user);
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
        
        if(this.options.order_by !== undefined && this.options.order_by !== '-'){
            console.log("order by: " + this.options.category_filter);
            
            switch(this.options.order_by){
            	case 'distance':
            		//navigator.geolocation.getCurrentPosition(this.location_success, this.location_err);
            		break
            	case 'featured':
            		this.params.featured = 1;
            		break;
            	case 'created':
            		break;
            	default:
            		break;
            }
            this.params.order_by = this.options.order_by;
        }

        if(this.params.order_by !== undefined && this.params.order_by == 'distance'){
        	navigator.geolocation.getCurrentPosition(this.location_success, this.location_err);
        }else{
        	this.fetch_models();
        }
    },

    location_success: function(position){
        this.params.lat = position.coords.latitude;
        this.params.lng = position.coords.longitude;
        //this.params.order_by = 'distance';
        this.fetch_models();
    },

    location_err: function(error){
        alert("location not available");
        //falling back to created
        this.params.order_by = 'created';
        
    },

    loadMoreResults: function(ev) {
    	ev.preventDefault();
    	this.page++;
    	this.search_models();
    },
    
    fetch_models: function(){
        console.log("action params: " + JSON.stringify(this.params));         
    	var self = this;
        this.model.fetch({
            data: self.params,
            success: function(mdl, response){
                console.log('action models fetched');
            }
        });
    	
    },

    reset_event: function(){
        this.render_page();
    },

    render_page: function(){
        this.model.each(function(item, index,list){  
            //console.log("action item: " + JSON.stringify(item));
            var action = {model: item.toJSON()};
            $("#action_list").append(new ActionItemView(action).render().el);
            if(index < list.length - 1){
                console.log("appending separator");
                $("#action_list").append(
                    '<hr class="action_separator">' 
                    );
            }
            }, 
            this
        );
                
        var add_pager = false;

        //if (this.model.meta.total_count > this.model.meta.limit + this.model.meta.offset) {
        //console.log("HAS NEXT: " + JSON.stringify(this.model.meta));
        if(this.model.meta.next){
            add_pager = true; 
           console.log("ADD PAGER"); 
        }else{
            console.log("NO PAGER");
        }
        
        var $pager_button = this.$el.find('.item-pager');
        
        if (add_pager) {
                $pager_button.removeClass('hide');
        }else{
                $pager_button.addClass('hide');
        }
       this.scroller.refresh(); 
    }
});

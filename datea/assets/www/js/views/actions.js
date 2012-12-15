var ActionsView = Backbone.View.extend({
    
    initialize: function () {
        
        this.user_model = this.options.user_model;
        //this.model.bind("reset", this.reset_event, this);
        //this.model.bind("change", this.add_event, this);
        //console.log("selected mode: " + this.options.selected_mode);
        this.selected_mode = this.options.selected_mode;
        this.items_per_page = 15;
        this.page = 0;
        this.render_mode = 'new';
        localUser.follows_actions = true;
        _.bindAll(this);
    },

    events: {
        'tap .load-more-results': 'loadMoreResults',
        'tap .action_detail': 'setActive',
        'tap .action-reload': 'reload',
    },
    
    setActive: function (ev) {
    	ev.preventDefault();
    	$(ev.currentTarget).addClass('active');
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },
    
    params_to_default: function() {
    	//this.user_follows_actions = true;
    	this.requery_done = false;
    },
    
    search_models: function(){
        
        if (this.render_mode == 'new') {
        	$('#actions_container', this.$el).addClass('hide');
        	$('.load-more-items', this.$el).addClass('hide');
        	$('.search-actions', this.$el).addClass('hide'); 
        };
        
        this.params = {
            limit: this.items_per_page,
            offset: this.page * this.items_per_page,
            published: 1,
            //page : this.page
            //following_user: this.user_model.get('id');
        };
        
        var get_location_first = false;

  		if(this.options.search_term !== undefined && this.options.search_term !== '-'){
            //console.log("search term: " + this.options.search_term); 
            this.params.q = this.options.search_term;  
        }

        if(this.options.category_filter !== undefined && this.options.category_filter !== '-'){
            //console.log("catefgory filter: " + this.options.category_filter);
            this.params.category_id = this.options.category_filter;
        }
        if(this.model.meta
                && this.model.total_count
                && this.params.limit + this.params.offset >= this.model.meta.total_count){
                    return;
                }
     	
        switch(this.selected_mode){

            case 'my_actions':
            	if (localUser.follows_actions) {
                	this.params.following_user = this.user_model.get('id');
                }else{
                	this.params.order_by = 'distance';
                	get_location_first = true;
                }
                break;

    	    case 'own_actions':
                this.params.user_id = this.user_model.get('id');
                break;

            case 'featured_actions':
                this.params.featured = 1;
                break;
   
            case 'all_actions':
                //console.log("all actions selected");
                break;                
        }
        
        if(this.options.order_by !== undefined && this.options.order_by !== '-'){
            //console.log("order by: " + this.options.category_filter);
            this.params.order_by = this.options.order_by;
            
            switch(this.options.order_by){
            	
            	case 'distance':
            		get_location_first = true;
            		break;
            		
            	case 'featured':
            		this.params.order_by = '-item_count';
            		break;
            		
            	case 'created':
            		break;
            	
            	default:
            		break;
            }
        }
        var param_str = JSON.stringify(this.params);
        if (this.options.router.current_action_params 
        	&& param_str == this.options.router.current_action_params 
        	&& this.selected_mode == this.options.router.current_action_mode
        	&& !this.options.router.action_reload) {
        		this.render_mode = 'new';
        		this.render_page();
        }else{
	        
	        if(get_location_first){
	        	$('#spinner').show();
	        	navigator.geolocation.getCurrentPosition(this.location_success, this.location_err, {
						maximumAge: 5000, 
						timeout: 5000, 
						enableHighAccuracy: true
					});
	        }else{
	        	this.fetch_models();
	        }
	   }
	   
	   this.options.router.current_action_params = param_str;
	   this.options.router.current_action_mode = this.selected_mode; 
	   this.options.router.action_reload = false;
    },
    
    reload: function () {
    	this.options.router.action_reload = true;
    	this.search_models();
    }, 

    location_success: function(position){
        this.params.lat = position.coords.latitude;
        this.params.lng = position.coords.longitude;
        //this.params.order_by = 'distance';
        this.fetch_models();
    },

    location_err: function(error){
    	var self = this;
    	notify_alert(
    		'Error de ubicación', 
    		'La ubicación no está disponible', 
    		function(){
    			//falling back to created
    			self.params.order_by = 'created';
        		self.fetch_models();
    		});
    },

    loadMoreResults: function(ev) {
    	ev.preventDefault();
    	this.page++;
    	this.render_mode = 'append';
    	this.search_models();
    },
    
    fetch_models: function(){
        //console.log("action params: " + JSON.stringify(this.params));         
    	var self = this;
    	var fetchparams = {
            data: self.params,
            success: function() {
            	self.render_page();
            },
            error: function() {
            	onOffline();
        	}
		};
		if (this.params.offset > 0) {
			fetchparams.add = true;
			fetchparams.remove = false;
		}
        this.model.fetch(fetchparams);
    },
	
	/*
    reset_event: function(){
    	console.log('reset event');
        this.render_page();
    },
    
    add_event: function() {
    	console.log('add event');
    	this.render_mode = 'append';
    	this.render_page();
    },
    */
    
    no_results_msg: '<div class="no-results">No se encontraron resultados. Inténtalo nuevamente con otros valores.</div>',

    render_page: function(){
    	
    	var $list = $("#action_list", this.$el);
    	var $list_title = $('#actions-list-title', this.$el);
    	var $list_intro = $('#actions-list-intro', this.$el);
    	var $list_search = $('.search-actions', this.$el);
    	
    	if (this.render_mode == 'new') {
    		$list.empty();
    	}else{
    		$list.append('<hr class="action_separator">');
    	}
    	
    	var add_pager = false;
        if(this.model.meta.next){
            add_pager = true; 
        }
    	
    	if (this.model.size() > 0) {
    		
    		if (this.selected_mode == 'my_actions') {
    			if(!localUser.follows_actions) {
	    			$list_title.html('Inciativas cercanas a tu zona').removeClass('hide');
	    			$list_intro.removeClass('hide');
	    			$list_search.addClass('hide');
	    		}else{
	    			$list_title.html('iniciativas que sigo');
	    			$list_intro.addClass('hide');
	    			$list_title.removeClass('hide');
	    			$list_search.removeClass('hide');
	    		}
    		}else if (this.selected_mode == 'all_actions') {
    			var title = this.model.size()+ ' de ' + this.model.meta.total_count+" resultado";
    			if (this.model.meta.total_count != 1) title = title+'s';
    			$list_title.html(title).removeClass('hide');
    			$list_intro.addClass('hide');	
    			if (!add_pager) $list_search.removeClass('hide');
    			else $list_search.addClass('hide');
    		}else{
    			$list_title.addClass('hide');
    			$list_intro.addClass('hide');
    			$list_search.addClass('hide');
    		}
    		
    		if (this.render_mode == 'new') {
    			var act_items = this.model.models;
    		}else{
    			var act_items = this.model.rest(this.params.offset);
    		}
    		
	        _.each(act_items, function(item, index,list){  
	            //console.log("action item: " + JSON.stringify(item));
	            var action = {model: item.toJSON(), id: 'action-'+item.get('id')};
	            $list.append(new ActionItemView(action).render().el);
	            if(index < list.length - 1){
	                $list.append('<hr class="action_separator">');
	            }
	        }, this);
	        
	    }else{
	    	if (this.selected_mode == 'my_actions') {
	    		localUser.follows_actions = false;
	    		if (!this.requery_done) {
	    			this.search_models();
	    			this.requery_done = true;	
	    		}else{
	    			this.requery_done = undefined;
	    			$list.html(this.no_results_msg);
	    			$list_intro.addClass('hide');
	    			$list_title.html('0 resultados').removeClass('hide');
	    			$list_search.removeClass('hide');
	    		}
	    	}else{
	    		$list.html(this.no_results_msg);
	    		$list_title.html('0 resultados').removeClass('hide');
	    		$list_search.removeClass('hide');
	    		$list_intro.addClass('hide');
	    	}
	    }
	    $('#actions_container', this.$el).removeClass('hide');
    
        // load more results button
        var $pager_button = this.$el.find('.load-more-items');    
        if (add_pager) {
        	$pager_button.removeClass('hide');
        }else{
            $pager_button.addClass('hide');
        }
        
        this.scroll_refresh();
        
        // scroll to last seen action
        if (this.options.router.back_to_action) {
        	var self = this;
        	setTimeout(function(){
        		var $curr_act = $('div#action-'+self.options.router.back_to_action);
        		if ($curr_act.size() == 1) {
	        		var scrolltop = $curr_act.position().top - (main_h-$curr_act.outerHeight(true))/3;
	        		if (scrolltop > 0) {
	        			self.scroller.scrollTo(0, -scrolltop, 0);
	        		}
	        		self.options.router.back_to_action = undefined;
	        	}
	        }, 100);
        }
        this.render_mode = 'new';
    }
});

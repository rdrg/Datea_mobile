


var HistoryListView = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'history-list-view',
	
	events: {
    	'tap .load-more-results': 'load_more_results',
    	'change #history-filter': 'filter_changed',
    },
	
	initialize: function () {
		this.user_model = this.options.user_model;
		this.model = new HistoryCollection();
    	this.model.bind("reset", this.reset_event, this);
    	this.selected_mode = 'combined';
    	this.items_per_page = 15;
    	this.page = 0;
    	/*
		this.pager_view = new Datea.PaginatorView({
			items_per_page: this.items_per_page,
			adjacent_pages: 2,
		});*/
	},

    render:function (ev) {
     this.$el.html( this.template());
     this.build_filter_options();
        return this;
    },
    
    // build filter options according to user
    build_filter_options: function () {
    	
    	this.filter_options = [
    		{value: 'combined', name: 'vista combinada'},
    		{value: 'contributions', name: 'mis dateos'},
    		{value: 'comments', name: 'mis commentarios'},
    		{value: 'votes', name: 'mis apoyos'},
		];    		
    },
    
    option_tpl: _.template('<option value="<%= value %>" <% if (selected) {%>selected="selected"<% } %>><%= name %></option>'),
    
    render_filter: function() {
    	this.build_filter_options();
    	var self = this;
    	var $filter = this.$el.find('#history-filter');
    	
    	for (var i in this.filter_options) {
    		var opt = this.filter_options[i];
    		opt.selected = this.selected_mode == opt.value;
    		$filter.append(this.option_tpl(opt));
    	}
    },
    
    filter_changed: function(ev) {
    	this.selected_mode = ev.currentTarget.value
		this.page = 0;
		this.$el.find('.item-list').empty();
		this.fetch_models();
    },
    
    fetch_models: function () {
    	
    	// show loading here
    	
    	var params = {
    		limit: this.items_per_page, 
    		offset: this.page * this.items_per_page,
    		following_user: this.user_model.get('id')
    	};
    	
    	if (this.model.meta
			&& this.model.total_count 
			&& params.limit + params.offset >= this.model.meta.total_count) 
			{return;}
    	
    	switch(this.selected_mode) {
    	
    		case 'contributions':
    			params.sender_type =  'map_item';
    			break;
    		case 'comments':
    			params.sender_type = 'comment';
    			break;
    		case 'votes':
    			params.sender_type = 'vote';
    			break;
    	}
    	//console.log("history params: " + JSON.stringify(params));
    	this.model.fetch({ 
    		data: params, 
    		error: function(){ onOffline(); },
    	});
    },
    
    render_page: function(page) {
    	
    	// hide loading here
    	//Datea.hide_small_loading(this.$el);
    	
    	var $list = this.$el.find('.item-list');
    	// $list.empty();
    	
    	if (typeof(page) != 'undefined') {
    		this.page = page;
    	}
    	
    	var add_pager = false;
    	if (this.model.meta.total_count > this.model.meta.limit + this.model.meta.offset) {
       		add_pager = true;  
    	}

    	if (this.model.size() > 0) {
	    	var self = this;
	    	this.model.each(function (item) {
	    			var opts = {model: item}
	            	$list.append(new HistoryItemView(opts).render().el);
	        }, this);
	    }else{
	    	$list.html('<p class="empty-result">No se encontraron resultados</p>');	
	    }
        
        var $pager_button = this.$el.find('.item-pager');
		if (add_pager) {
			$pager_button.removeClass('hide');
		}else{
			$pager_button.addClass('hide');
		}
        this.scroll_refresh();
    },
    
    load_more_results: function(ev) {
    	ev.preventDefault();
    	this.page++;
    	this.fetch_models();
    },
    
    reset_event: function(ev) {
        this.render_filter();
    	this.render_page();
    } 
	
});

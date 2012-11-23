
var MapItemClusterView = Backbone.View.extend({
	
	initialize: function() {
		this.page = this.options.page || 0;
		//var $cluster_c = $('.cluster-content-view');
		//var c_h = main_h - parseInt($cluster_c.css('margin-top').replace('px','')) - parseInt($cluster_c.css('margin-bottom').replace('px','')) - parseInt($cluster_c.css('padding-top').replace('px','')) - parseInt($cluster_c.css('padding-bottom').replace('px',''));
		//$cluster_c.css('height', c_h+"px");
		//$cluster_c.css('width', $('#main').css('width'));
	},
	
	events_active: true,
	
	events: {
		'click .next-item': 'show_next_item',
		'click .prev-item': 'show_prev_item',
	},
	
	render: function(ev) {
		
		var context = {
			page: this.page,
			total_items: this.collection.length,
		};
		
		var item_view = new MapItemDetailView({model: this.collection.models[this.page]});
		this.$el.html(this.template(context));
		this.$el.find('.current-item-content').html(item_view.render().el);
		var self = this;
		setTimeout(function(){
			self.events_active = true;
		}, 500);
		
		return this;
	},
	
	show_next_item: function(ev) {
		ev.preventDefault(); 
		
		if (this.events_active == true) {
			this.events_active = false;
		}else{
			return;
		}
		this.page++;
		this.render();
		if (this.scroller) this.scroll_refresh();
	},
	
	show_prev_item: function(ev) {
		ev.preventDefault(); 
		
		if (this.events_active == true) {
			this.events_active = false;
		}else{
			return;
		}
		
		this.page--;
		this.render();
		if (this.scroller) this.scroll_refresh();
	}, 
	
});
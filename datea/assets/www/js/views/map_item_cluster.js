
var MapItemClusterView = Backbone.View.extend({
	
	initialize: function() {
		this.page = this.options.page || 0;
	},
	
	//events_active: true,
	
	events: {
		'tap .next-item': 'show_next_item',
		'tap .prev-item': 'show_prev_item',
	},
	
	render: function(ev) {
		
		var context = {
			page: this.page,
			total_items: this.collection.length,
		};
		var item_view = new MapItemDetailView({model: this.collection.models[this.page], parentView: this});
		this.$el.html(this.template(context));
		this.$el.find('.current-item-content').html(item_view.render().el);
		var self = this;
		/*
		setTimeout(function(){
			self.events_active = true;
		},300);
		*/
		return this;
	},
	
	show_next_item: function(ev) {
		ev.preventDefault(); 
		/*
		if (this.events_active == true) {
			this.events_active = false;
		}else{
			return;
		}*/
		this.page++;
		this.render();
		if (this.scroller) this.scroll_refresh();
	},
	
	show_prev_item: function(ev) {
		ev.preventDefault(); 
		/*
		if (this.events_active == true) {
			this.events_active = false;
		}else{
			return;
		}*/
		
		this.page--;
		this.render();
		if (this.scroller) this.scroll_refresh();
	}, 
	
});
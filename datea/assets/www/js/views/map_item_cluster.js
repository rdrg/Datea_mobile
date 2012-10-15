
var MapItemClusterView = Backbone.View.extend({
	
	initialize: function() {
		this.page = this.options.page || 0;
		
	},
	
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
		
		return this;
	},
	
	show_next_item: function(ev) {
		ev.preventDefault(); 
		this.page++;
		this.render();
	},
	
	show_prev_item: function(ev) {
		ev.preventDefault(); 
		this.page++;
		this.render();
	}, 
	
});
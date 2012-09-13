window.HeaderView = Backbone.View.extend({
	initialize: function () {
		this.render();
	},
	render: function () {	
		// FIXME: NOT PROUD
		if (localSession.get('logged')) {
			var userid = localSession.get('userid');
			this.$el.html(this.template({ userid: userid }));
			return this;
		}
		
		this.$el.html(this.template( { userid: null }));
		return this;
	},
	selectMenuItem: function (item) {
		$('.nav li').removeClass('active');
		if (item) {
			$('.' + item).addClass('active');
		}
	}
});

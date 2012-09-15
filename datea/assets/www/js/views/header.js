window.HeaderView = Backbone.View.extend({
	initialize: function () {
		localSession.on('change', this.render, this);
	},
	render: function () {	
		// FIXME: NOT PROUD
		if (localSession.get('logged')) {
			var userid = localSession.get('userid');
			console.log(this.$el)
			this.$el.html(this.template({ userid: userid }));
			return this;
		}
		
		this.$el.html(this.template({ userid: false }));
		return this;
	},
	selectMenuItem: function (item) {
		$('.nav li').removeClass('active');
		if (item) {
			$('.' + item).addClass('active');
		}
	}
});

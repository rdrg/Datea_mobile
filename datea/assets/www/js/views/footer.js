window.FooterView = Backbone.View.extend({
	initialize: function () {
		localSession.on('change', this.render, this);
	},
	render: function () {
		// FIXME: NOT PROUD
		if (localSession.get('logged')) {
			var userid = localSession.get('userid');
			this.$el.html(this.template({ userid: userid }));
			return this;
		}
		
		this.$el.html(this.template({ userid: false }));
		return this;
	}
});
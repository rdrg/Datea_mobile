window.HeaderView = Backbone.View.extend({
	initialize: function () {
		this.render();
	},
	render: function () {
		this.$el.html(this.template());
		return this;
	},
	selectMenuItem: function (item) {
		$('.nav li').removeClass('active');
		if (item) {
			$('.' + item).addClass('active');
		}
	}
});

window.LoggedOutHeaderView = Backbone.View.extend({
	initialize: function () {
		localSession.on('change', this.render, this);
	},
	render: function () {	
            // FIXME: NOT PROUD
            if (localSession.get('logged')) {
                    var userid = localSession.get('userid');
                    console.log("loged header");
                    this.template = _.template($.get('tpl/LoggedInHeaderView.html'));
                    return this;
            }else{
                console.log("not logged header");
                this.template = _.tempate($.get('tpl/LoggedOutHeaderView.html'));
                this.$el.html(this.tempate());
            }

            this.$el.html(this.template({ userid: false }));
            return this;
	}
});


var CustomSelectBoxView = Backbone.View.extend({
	
	initialize: function() {
		if (this.options.value) {
			this.value = this.options.value;
			this.selected_option = _.find(this.options.options, function(opt){ return opt.value == this.value; }, this);
		}else{
			this.value = this.options.options[0].value;
			this.selected_option = this.options.options[0];
		}
	},
	
	events : {
		'tap .custom-select-box': 'open_options',
	},
	
	render: function () {
		var context = {selected_option: this.selected_option};
		this.$el.html(this.template(context));
		return this;
	},
	
	open_options: function (ev) {
		ev.preventDefault()
		if (this.options.open_callback) this.options.open_callback();
		this.optionsView = new CustomSelectBoxOptionsView({
			parent_view: this,
		});
		$('body').append(this.optionsView.render().el);
		this.optionsView.post_render();
	},
	
	select_option: function (value) {
		this.value = value; 
		this.selected_option = _.find(this.options.options, function(opt){ return opt.value == this.value; }, this);
		this.render();
		if (this.options.select_callback) this.options.select_callback(this.value);
	}
	
});


var CustomSelectBoxOptionsView = Backbone.View.extend({
	
	initialize: function() {
		this.parent_view = this.options.parent_view; 
	},
	
	events: {
		'tap .opt-link': 'select_option',
	},

	render: function () {
		var context = {
			options: this.parent_view.options.options,
			selected_option: this.parent_view.selected_option,
		}
		this.$el.html(this.template(context));
		
		var self = this;
		window.backbutton_func = function () {
			if (self.parent_view.options.cancel_callback) self.parent_view.options.cancel_callback();
			self.close();
		}
		return this;
	},
	
	post_render: function () {
		var self = this;
		$('.cselect-opt-wrapper', this.$el).slideDown('normal', function() {
			self.scroll('opt-scroll-container');
		});
	},
	
	select_option: function (ev) {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		var value = $(ev.currentTarget).data('value');
		$('.opt-link').removeClass('active');
		$('#opt-'+value).addClass('active');
		var self = this;
		setTimeout(function(){
			$('.cselect-opt-wrapper', self.$el).hide(0, function() {
				self.close();
				self.parent_view.select_option(value);
				window.backbutton_func = undefined;
			});
		}, 100);
		return false;
	}
	
});

action_extra_tpl = {
	days_left: _.template('<div class="action-active action-days-left"><span class="icono">&nbsp;</span>faltan <%= days_left %> días</div>'),
	last_day: _.template('<div class="action-active action-last-day"><span class="icono">&nbsp;</span>último día!</div>'),
	expired: _.template('<div class="action-active action-expired"><span class="icono">&nbsp;</span> <span class="warning">finalizada</span></div>'),
}

var ActionView = Backbone.View.extend({
    render: function(){
    
        var mdl = this.model.toJSON();
        //console.log("model: " + JSON.stringify(mdl));
        
        // end date
        if (this.model.get('end_date') == null) {
			mdl.is_active = true;
		}else{
			var now = new Date();
			now.setHours(0,0,0,0);
			var end = utils.dateDayFromISO(this.model.get('end_date'));
			if (now <= end) {
				mdl.is_active = true;
				var days_left = Math.ceil((end.getTime()-now.getTime())/86400000);
				if (days_left > 0) {
					mdl.active_message = action_extra_tpl.days_left({days_left: days_left});
				}else{
					mdl.active_message = action_extra_tpl.last_day();
				}
			}else{
				mdl.is_active = false;
				mdl.active_message = action_extra_tpl.expired();
			}
		}
        
        if(!mdl.name){
            //mdl['api_url'] = api_url;
            return this;
        }
        console.log(mdl);
        this.$el.html(this.template(mdl));
        
        // follow widget
        var f_options = {
  				object_type: 'dateaaction',
				object_id: this.model.get('id'),
				followed_model: this.model,
				silent: true,
  			}
  		if (localUser.get('id') == this.model.get('user').id) {
  			f_options.read_only = true;
  			f_options.is_own = true;
  		}
		this.follow_widget = new FollowActionWidgetView(f_options);
		
		this.$el.find('.follow-button').html(this.follow_widget.render().el);         
        
        return this;
    }
});

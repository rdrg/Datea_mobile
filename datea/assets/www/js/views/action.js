var ActionView = Backbone.View.extend({
    render: function(){
    
        var mdl = this.model.toJSON();
        //console.log("model: " + JSON.stringify(mdl));
        
        if(!mdl.name){
            //mdl['api_url'] = api_url;
            return this;
        }
        //console.log(mdl);
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

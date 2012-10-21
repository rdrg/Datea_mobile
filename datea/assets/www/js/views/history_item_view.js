
var history_tpls = {
	//MAP ITEMS
	map_item_receiver: _.template('<a href="#<%= url %>">dateo de <%= name %></a>'),
    map_item_sender: _.template('<%= username %> dateó en "<%= receiver_html %>"'),

	//MAP ITEM RESPONSE
	map_item_response_sender: _.template('<%= username %> respondió a <%= receiver_html %>'),

	// COMMENT 
	comment_sender: _.template('<%= username %> comentó en <%= receiver_html %>'),

	//VOTE
	vote_sender: _.template('<%= username %> ahora apoya <%= receiver_html %>'),

	// FOLLOW
	follow_sender:  _.template('<%= username %> ahora sigue <%= receiver_html %>'),

	action_receiver:  _.template('<a href="#<%= url %>"><%= name %></a>')
}


var HistoryItemView = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'history-item',
	
	render: function (ev) {
		
		var stype = this.model.get('sender_type');
		var rtype = this.model.get('receiver_type');
		
		var recv_arr = [];
		var recv_items = this.model.get('receiver_items');
		for (i in recv_items) {
			recv_arr.push(history_tpls[rtype+'_receiver'](recv_items[i]));
		}

		var context = this.model.toJSON();
		context.receiver_html = recv_arr.join(', ');
		context.title_html = history_tpls[stype+'_sender'](context);
		context.link = context.receiver_items[0].url;
		context.created = utils.formatDateFromISO(context.created, "dd.mm.yyyy - H:MM");
		
		this.$el.html(this.template(context));
		
		return this;
	},
});
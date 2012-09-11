window.utils = {
	loadTpl: function(views, cb) {
		var defs = [];

	    $.each(views, function(index, view) {
	    	if (window[view]) {
	    		defs.push($.get('tpl/' + view + '.html', function(data) {
	    			window[view].prototype.template = _.template(data);
	            }, 'html'));
	        } else if(!window[view]){
	            alert(view + " not found");
	        }
	    });
	    $.when.apply(null, defs).done(cb);
	}	
}
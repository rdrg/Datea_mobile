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
	},
	
	dateFromISO: function(isostr) {
 		var parts = isostr.match(/\d+/g);
 		return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
	},

	dateDayFromISO: function(isostr) {
		var parts = isostr.match(/\d+/g);
 		return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
	},

	formatDateFromISO: function(isostr, format) {
		return  this.dateFromISO(isostr).format(format);
	},
	
	get_base_web_url: function() {
		return 'http:www.datea.pe';
	}	
}

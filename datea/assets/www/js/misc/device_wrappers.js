

function notify_alert(title, message, callback) {
	if (navigator.notification){
	    navigator.notification.alert(
	        message,
	        function(){
	        	if (typeof(callback) != 'undefined') callback();
	        },
	        title,
	        'ok'
	    );
	 }else{
	 	alert(message);
	 	if (typeof(callback) != 'undefined') callback();
	 }
};


function notify_confirm(title, message, callback) {
	
	if (navigator.notification) {
		navigator.notification.confirm(
			message,
			function (index) {
				if (index == 1) callback();
			},
			title,
			'ok,cancelar'
		)
	}else{
		if (window.confirm(message)) {
			callback();
		}
	}
}


/***********************  LINKS  ************************/

function init_links() {
	
	$(document).on('tap','.link, a',{}, function(ev){
		ev.stopPropagation();
		ev.preventDefault();
		var $this = $(this);
		if ($this.hasClass('back-link')){
			onBackKeyPress();
			return;
		} else if (!!$this.attr('href')) {
			var href = $this.attr('href').replace('#','');
		}else{
			var href = $this.data('href');
		} 
		dateaApp.navigate(href, {trigger: true});
	});
	/*
	$(document).on('click', '.link, a', {}, function(ev){
		ev.stopPropagation();
		ev.preventDefault();
	});
	*/
}


/***********************  SOFTKEYBOARD  ************************/

function onKBHide() {
	if (input_focused) {
		footer_visible = footer_was_visible;
		return;
	}
	var inter = setInterval(function(){
		if ($(window).height() >= window_h) {
			clearInterval(inter);
			if (footer_was_visible) showFooter('show');
			if (window.dateaApp.currentView.scroller) window.dateaApp.currentView.scroll_refresh();
		}
	}, 100);
}

function onKBShow() {
	footer_was_visible = footer_visible;
	showFooter('hide');
}

input_focused = false;
function init_kb_extra() {
	
	$(document).on('focus','input, textarea', {}, function(){
		input_focused = true;
		setTimeout(function(){
			input_focused = false;
		}, 700)
	});
	$(document).on('blur','input, textarea', {}, function(){
		input_focused = false;
	});
}


/********************  MENU BUTTON AND FOOTER  ****************/


footer_visible = true;
footer_was_visible = true;
function onMenuDown() {
	showFooter('toggle');
	if (!dateaApp.currentView.manual_scroll) {
		dateaApp.currentView.scroll_refresh();
	}else{
		if (dateaApp.currentView.manual_scroll_refresh) {
			dateaApp.currentView.manual_scroll_refresh();
		}
	}
}

function showFooter(mode) {
	
	switch(mode) {
		case 'show':
			footer_visible = true;
			$('body').addClass('with-footer');
			$('#footer').slideDown('fast');
			break;
		case 'hide':
			$('body').removeClass('with-footer');
			footer_visible = false;
			$('#footer').hide();
			break;
		case 'toggle':
			if (footer_visible) {
				showFooter('hide');
			}else{
				showFooter('show');
			}
			break;
	}
}


/****************** AUTOSIZE TEXTAREAS *******************/

function init_autosize() {
	$(document).on('focus', 'textarea',{},function(){
		if (!$(this).hasClass('autosized')) {
			$(this).addClass('autosized').autosize();
		}
	});
}


/******************* BACK KEY **********************/


function onBackKeyPress() {
	input_focused = false;
	if (typeof(window.backbutton_func) != 'undefined') {
		window.backbutton_func();
		window.backbutton_func = undefined;
	}else{
		window.history.back();
	}
}


/***************** OFFLINE ***************************/

function onOffline(close){
	var error = 'Datea necesita Internet. Revisa tu conexión e intenta nuevamente.';
	if (navigator.notification){
	    navigator.notification.alert(
	        error,
	        function() 
	        {
	        	if (typeof(close) != 'undefined' && close == true) {
	        		if (navigator.app && navigator.app.exitApp) {
				        navigator.app.exitApp();
				    } else if (navigator.device && navigator.device.exitApp) {
				        navigator.device.exitApp();
				    }
	        	}
	        },
	        'Error de conexión',
	        'ok'
	    );
	 }else{
	 	alert(error);
	 }
	 $('#spinner').fadeOut("fast");
}

function offLineAlertDismissed() {
	// he quitado esto, porque no creo que deberia salirse de la app, sino simplemente avisar.
}
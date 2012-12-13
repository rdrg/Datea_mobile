Backbone.View.prototype.scroll = function(elem){
	
	this.$el.addClass('scroll-container');
	
	if (typeof(elem) == 'undefined') elem = 'main';
	
    this.scroller = new iScroll( elem,{
        hScroll : false,
        fixedScrollbar: false,
        hideScrollbar: false,
        useTransform: false,
        zoom: false,
        //checkDOMChanges: false,
        //bounce: false,
        onBeforeScrollStart: function (e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
        }
    });
    
    var self = this;
    $('img', this.$el).load(function(){
    	setTimeout(function(){
    		self.scroller.refresh();
    	},0);
    });
};


Backbone.View.prototype.scroll_refresh = function () {
	var self = this;
	setTimeout(function(){
		self.scroller.refresh();
		var $img = $('img', this.$el);
		$img.unbind('load');
		$img.load(function(){
			setTimeout(function(){
				self.scroller.refresh();
			}, 0);
		});
	},0);
}
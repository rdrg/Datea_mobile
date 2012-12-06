var SearchFormView = Backbone.View.extend({
   
    initialize: function(){
        this.search_term = '-';
        this.category = '-';
        this.order = 'created';
        this.items_per_page = 10;

        _.bindAll(this);
    },

    events:{
        //'change #search_term': 'set_search_term',
        //'change #category_filter': 'set_category',
        //'change #order_by': 'set_order',
        'click #submit_search': 'search'
    },
    render: function(){
        var context = { 'cat_list': this.model.toJSON()};
        this.$el.html(this.template(context));
        var ret = false;
        this.delegateEvents();
        return this; 
    },

    set_search_term: function(){
        this.search_term = $('#search_term').val();
        //console.log("search term: " + this.search_term); 
    },

    set_category: function(event){
        this.category = event.currentTarget.value;
        //console.log("set category: " + this.category);
    },

    set_order: function(event){
        //this.params.order_by = $('#order_by').val();
        this.order = event.currentTarget.value;
        //console.log("setting order: " + this.order); 
    },
    search:function(event){
        //console.log("performing search");
        event.preventDefault();
        if($('#search_term').val() !== ''){
        	this.search_term = $('#search_term').val();
        }
        
        this.category = $('#category_filter option:selected').val();
        this.order =  $('#order_by option:selected').val();
        //console.log("submit search: " + this.search_term + "," +  this.category + "," + this.order_by );
        
        dateaApp.navigate("/search/" + this.search_term + "/" + this.category + "/" + this.order ,
                {trigger: true}
                );
    } 
});

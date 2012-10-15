var CreateMapItemView = Backbone.View.extend({

    initialize: function(){
        
        var self = this;
       
        if(this.options.mappingModel.get('item_categories') !== undefined){
            console.log('setting step to 1');
            this.step = 1;
        }else{
            console.log('setting step to 2');
            this.step = 2;
        }
        //if this.model.attributes.
        _.bindAll(this, 'nextView');

    },
    events: {
        "click #next_button": "render"
    },

    render: function(){
        this.$el.html(this.template());
        this.nextView();
        return this;
    },

    nextView: function(){
        console.log("next view");

        if(this.step == 1){
            console.log("perform actions for step 1");
            this.stepOneView = new CreateMapItemOne({
                model: this.model,
                mappingModel: this.options.mappingModel  
            });
            console.log("mapping url: " + this.model.get('action'));
            this.$("#create_mapitem_content").html(this.stepOneView.render().el); 
            this.step = 2;

        }else if(this.step == 2){
            console.log("perform actions for step 2");
            this.stepTwoView = new CreateMapItemTwo({
                model: this.model,
                mappingModel: this.options.mappingModel
            });
            this.$("#create_mapitem_content").html(this.stepTwoView.render().el); 
            this.step = 3;

        }else if(this.step == 3){
            console.log("perform actions for step 3");
            this.stepThreeView = new CreateMapItemThree({
                model: this.model,
                mappingModel: this.options.mappingModel
            });
            this.$("#create_mapitem_content").html(this.stepThreeView.render().el);
            this.step = 4;
        }
    }
});

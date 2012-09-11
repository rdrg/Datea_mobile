
$(document).ready(function(){
        Backbone.Tastypie.prependDomain = api_url;
        window.local_session = new localSession();
        window.my_user = new User();
        //local_session.save();
        //local_session.fetch();
        if(localStorage.getItem('authdata') !== undefined){
            authdata = JSON.parse(localStorage.getItem('authdata'));
            local_session.set(authdata);

            if(local_session.get('logged')){
                var userid = local_session.get('userid');
                my_user.fetch({
                    data: {'id': userid},
                    success: function(model, response){  
                        startApp();
                    }
                    
                });
            }
        }else{
            startApp();
        }
        //var startApp = function(){
        window.app = new AppRouter();
        Backbone.history.start(); 
        //}
   
});


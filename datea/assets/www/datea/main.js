//function startApp(){
$(document).ready(function(){
  tpl.loadTemplates(['home','login_form','edit_user','enter','action_detail',
                  'item_detail', 'item_list', 'action_list', 'navbar', 'register',
                  'user_profile'], 

                  function(){
                   var start_App = function(){
                      window.app = new AppRouter();
                      Backbone.history.start(); 
                    };
                  });
});
//}

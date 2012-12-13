window.HomeView = Backbone.View.extend({
  initialize:function() {
    this.render();
  },

  render:function() {
    this.$el.html(this.template);
    return this;
  },

  events:{
    //'mousedown button#login_btn' : 'login',
    'tap button#login_btn' : 'login',

    'tap button#explore_btn' : 'explore',
    'tap button#participate_btn' : 'participate'
  },
  
  login: function(data){
    //console.log("in the login");
    $('#login_btn i').css('background-image','url(img/icono_registro_on.png)');
    dateaApp.navigate("login", {trigger: true});
  },

  explore: function(data){
    $('#explore_btn i').css('background-image','url(img/icono_apoya_on.png)');
  },

  participate: function(data){
    $('#participate_btn i').css('background-image','url(img/icono_participa_on.png)');
  }
});

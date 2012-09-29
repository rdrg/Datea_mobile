window.HomeView = Backbone.View.extend({
  initialize:function() {
    this.render();
  },

  render:function() {
    this.$el.html(this.template);
    return this;
  },

  events:{
    'mousedown button#login_btn' : 'login',
    'mousedown button#explore_btn' : 'explore',
    'mousedown button#participate_btn' : 'participate'
  },
  
  login: function(data){
    $('#login_btn i').css('background-image','url(img/icono_registro_on.png)');
  },

  explore: function(data){
    $('#explore_btn i').css('background-image','url(img/icono_apoya_on.png)');
  },

  participate: function(data){
    $('#participate_btn i').css('background-image','url(img/icono_participa_on.png)');
  }
});
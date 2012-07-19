document.addEventListener("deviceready", function(){
	console.log("device ready !!!!!!!!!!!!!!");
},false);

$( function (){
	//var data = $('#login_datea').serialize();
	
	//prevent form's default action
	$("#login_form").submit(function(form){
		form.preventDefault();
	});
	//submitting form data with a link because of an error in form submission
	$("#submit_link").click(function(){
	
		var userdata = {
			username : $("#user_input").val(),
			password : $("#pass_input").val()
		};
		console.log(userdata.username, userdata.password);

		$.post('http://192.168.2.113:8000/api/v1/accounts/signin/?format=json',
			JSON.stringify(userdata),
			function(response){
				console.log(response.status + response.token);
				
			},
			'json'
		);
	});
});

/*
window.startApp = function(){
  var self = this;
  //probando guardar los keys en lawnchair
  var db = Lawnchair({name: 'dateaStore'},function(db){
    db.exists('dateaKey', function(data){
      console.log('dateaKey exists: ',data);

      if(data === true){
        db.get('dateaKey', function(data){
          window.dateaKey = data.token;
          console.log(dateaKey);
        })
      } else {
        window.dateaKey = null;
      }
    });
  });
}
*/


//Esto que esta comentado es la autenticacion con twitter usando el plugin
//de phonegap, lo unico que hay que hacer es cambiar los callbakcs de los
//urls para que peguen a las urls reales, igual como esta funciona.

/*
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  console.log("device ready");



  var twitterkey = "twitter";

$('#twitter_button').on('touchstart', function() {
  console.log('pressed')
  
  var twitteroptions = { // create an application in twitter and populate the values below
      consumerKey: 'RJqf4w0hdSusPFrLtfwkA',
      consumerSecret: 'drV2eP4zYgx8WqTSqzBAhxf6oeJcSMwTUVbBXpJ0qg',
      callbackUrl: 'http://10.0.2.2:8000/' 
  };

  var twitter = TwitterConnect.install();
  twitter.connect(twitteroptions);
  twitter.onConnect = onTwitterConnected;

});

function onTwitterConnected() {
  console.log("on twitter connected");
  var access_token = JSON.parse(window.localStorage.getItem(window.plugins.twitterConnect.twitterKey));
  var twitteroptions = {
    consumerKey: 'RJqf4w0hdSusPFrLtfwkA',
    consumerSecret: 'drV2eP4zYgx8WqTSqzBAhxf6oeJcSMwTUVbBXpJ0qg',
    callbackUrl: 'http://10.0.2.2:8000/' 
  };
  
  twitteroptions.accessTokenKey = access_token.accessTokenKey;
  twitteroptions.accessTokenSecret = access_token.accessTokenSecret;
  window.plugins.twitterConnect.getUser(twitteroptions);
  window.plugins.twitterConnect.onConnect = twitter_register;
}

function twitter_register( ) {
  var user = JSON.parse( window.localStorage.getItem('twitter_info'));
  var access_token = JSON.parse(window.localStorage.getItem(window.plugins.twitterConnect.twitterKey));
  var oauth_token = access_token.accessTokenKen;
  //your own application logic to store values in database
  //
  };

}
*/

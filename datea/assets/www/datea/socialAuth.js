function IcanhazConnection(){
  var twitterkey = "twitter"

$('#twitter_button').on('touchstart', function() {
  var twitteroptions = { // create an application in twitter and populate the values below
      consumerKey: 'RJqf4w0hdSusPFrLtfwkA',
      consumerSecret: 'drV2eP4zYgx8WqTSqzBAhxf6oeJcSMwTUVbBXpJ0qg',
      callbackUrl: 'http://10.0.2.2:8000/' 
  }

  var twitter = TwitterConnect.install()
  twitter.connect(twitteroptions)
  twitter.onConnect = onTwitterConnected

});

function onTwitterConnected() {
  var access_token = JSON.parse(window.localStorage.getItem(window.plugins.twitterConnect.twitterKey))
  var twitteroptions = {
    consumerKey: 'RJqf4w0hdSusPFrLtfwkA',
    consumerSecret: 'drV2eP4zYgx8WqTSqzBAhxf6oeJcSMwTUVbBXpJ0qg',
    callbackUrl: 'http://10.0.2.2:8000/' 
  }
  
  twitteroptions.accessTokenKey = access_token.accessTokenKey
  twitteroptions.accessTokenSecret = access_token.accessTokenSecret
  window.plugins.twitterConnect.getUser(twitteroptions)
  window.plugins.twitterConnect.onConnect = twitter_register
}

function twitter_register( ) {
  var user = JSON.parse( window.localStorage.getItem('twitter_info'))
  var access_token = JSON.parse(window.localStorage.getItem(window.plugins.twitterConnect.twitterKey))
  var oauth_token = access_token.accessTokenKen
  //your own application logic to store values in database
  //
  }

})
};

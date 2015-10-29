var credentials = {
	//clientID: 'dfc03f5cd3637a05939d2e47871b6532',
	//clientSecret: 'fefbcec6318feab8ad9cdb395b447e8b',
	//site: 'https://www.fitbit.com/',
	//tokenPath: '/oauth2/token',
	//authorizationPath: 'oauth2/authorize'
	clientID: '',
	clientSecret: '',
	site: 'https://www.fitbit.com/',
	tokenPath: '/oauth2/token',
	authorizationPath: 'oauth2/authorize'
};

function FitbitAPIoauth2(consumerKey, consumerSecret) {
	console.log("Init");
	console.log("consumer key : " + consumerKey);
	console.log("consumer secret : " + consumerSecret);
	credentials.clientID = consumerKey;
	credentials.clientSecret = consumerSecret;

}

var oauth2 = require('simple-oauth2')(credentials);


FitbitAPIoauth2.prototype = {
	authorizeFitBit: function () {
		var authorization_uri = oauth2.authCode.authorizeURL({
			redirect_uri: 'http://localhost:1337/callback',
			scope: 'notifications',
			state: '3(#0/!~'
		});
		console.log(authorization_uri);
		return authorization_uri;
	},
	refreshFitbitToken: function() {
		var token;
		oauth2.authCode.getToken({
			code: authorizationCode,
			redirect_uri: 'http://localhost:3000/callback'
		}, saveToken);

		function saveToken(error, result) {
			if (error) { console.log('Access Token Error', error.message); }
			token = oauth2.accessKey.create(result);
		}
		console.log(token);
		return token;
	}

};

module.exports = FitbitAPIoauth2;

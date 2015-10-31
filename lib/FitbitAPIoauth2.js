var request = require( 'request' );
var moment  = require( 'moment' );
var async = require( 'async' );

var log4js = require('log4js');
log4js.configure('./config/log4js-config.json', { reloadSecs: 300 });

var logger = log4js.getLogger("fitbitapi");
console.log(logger);
token = {
	"access_token": "xxx",
	"expires_in": "xxx",
	"expires_at": "20150829T10:20:25",
	"refresh_token": "xxx"
}

var persist=false;

config = {
	"creds": {
		"clientID": "229RMF",
		"clientSecret": "fefbcec6318feab8ad9cdb395b447e8b"
	},
	"uris": {
		"authorizationUri": "https://www.fitbit.com",
		"authorizationPath": "/oauth2/authorize",
		"tokenUri": "https://api.fitbit.com",
		"tokenPath": "/oauth2/token"
	},
	"authorization_uri": {
		"redirect_uri": "http://localhost:1337/fitbit/auth_callback/",
		"response_type": "code",
		"scope": "activity nutrition profile settings sleep social weight heartrate",
		"state": "3(#0/!~"
	}
}

function FitbitAPIoauth2(config) {
	logger.debug(config);
	this.config = config;
	this.token  = null;
	if ( ! this.config.timeout ) this.config.timeout = 60 * 1000; // default 1 minute

}

FitbitAPIoauth2.prototype = {
	authorizeFitBit: function () {
		return require('simple-oauth2')({
			clientID: this.config.creds.clientID,
			clientSecret: this.config.creds.clientSecret,
			site: this.config.uris.authorizationUri,
			authorizationPath: this.config.uris.authorizationPath,
		}).authCode.authorizeURL( this.config.authorization_uri );
	},
	refresh: function(cb) {
		var self = this;
		request({
			uri: self.config.uris.tokenUri +  self.config.uris.tokenPath,
			method: 'POST',
			headers: { Authorization: 'Basic ' +  new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') },
			timeout: self.config.timeout,
			form: {
				grant_type: 'refresh_token',
				refresh_token: self.token.refresh_token
			}
		}, function( err, res, body ) {
			if ( err ) return cb( new Error( 'token refresh: ' + err.message ) );
			try {
				var token = JSON.parse( body );
				token.expires_at = moment().add( token.expires_in, 'seconds' ).format( 'YYYYMMDDTHH:mm:ss' );
				self.token = token;
				if ( ! self.persist ) return cb( null, token );
				self.persist( self.token, function( err ) {
					if ( err ) return cb( err );
					cb( null, token );
				});
			} catch( err ) {
				cb( err );
			}
		});
	},
	fetchToken: function(code, cb){
		var self = this;
		request({
			uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
			method: 'POST',
			headers: { Authorization: 'Basic ' +  new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') },
			timeout: self.config.timeout,
			form: {
				code: code,
				redirect_uri: self.config.authorization_uri.redirect_uri,
				grant_type: 'authorization_code',
				client_id: self.config.creds.clientID,
				client_secret: self.config.creds.clientSecret,
			}
		}, function( err, res, body ) {
			if ( err ) return cb( err );
			try {
				var token = JSON.parse( body );
				logger.debug(token);
				token.expires_at = moment().add( token.expires_in, 'seconds' ).format( 'YYYYMMDDTHH:mm:ss' );
				self.token = token;
				if ( ! self.persist ) cb( null, token );
				self.persist( self.token, function( err ) {
					if ( err ) return cb( err );
					cb( null, token );
				});
			} catch( err ) {
				logger.error(err);
				cb( err );
			}
		});
	},
	request: function(options, cb){
		var self = this;

		if ( ! self.token )
			return cb( new Error( 'must setToken() or getToken() before calling request()' ) );

		if ( ! self.token.access_token )
			return cb( new Error( 'token appears corrupt: ' + JSON.stringify( self.token) ) );

		async.series([
			function( cb ) {
				if ( moment().unix() >= moment( self.token.expires_at, 'YYYYMMDDTHH:mm:ss' ).unix() )
					self.refresh( cb );
				else
					cb();
			},
			function( cb ) {
				if ( ! options.auth ) options.auth = {};
				if ( ! options.timeout ) options.timeout = self.config.timeout;
				options.auth.bearer = self.token.access_token;
				request( options, function( err, res, body ) {
					if ( err ) return cb( new Error( 'request: ' + err.message ) );
					self.limits = {
						limit: res.headers[ 'fitbit-rate-limit-limit' ],
						remaining: res.headers[ 'fitbit-rate-limit-remaining' ],
						reset: res.headers[ 'fitbit-rate-limit-reset' ],
					};
					cb( null, body );
				});
			},
		], function( err, results ) {
			if ( err ) return cb( err );
			cb( null, results[1], results[0] );
		});
	},
	getLimits: function(){
		return this.limits;
	},
	setToken: function( token ){
		this.token = token;
	},
	getToken: function( token ){
		return this.token;
	}


};

module.exports = FitbitAPIoauth2;
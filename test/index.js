var should = require('chai').should();


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
};

var FitbitAPIoauth2 = require('../index.js'),
        client = new FitbitAPIoauth2(config);

describe('test init', function() {

	it('initialize', function() {
        console.log(client);
    });
});

describe('test auth', function() {

    it('authorize', function() {
        console.log(client);
        var authorizeUrl = client.authorizeFitBit();
        console.log(authorizeUrl);
    });
});

describe('fetch token', function() {

    it('fetchToken', function(done) {
        setTimeout(function() {
            done();
        }, 7000);
        console.log(client);

        client.fetchToken("1aa69ca631a4be26d3201769d839c22c103c0057", function( err, token ) {
            console.log(" fetch token from the fitbit api - " + token.access_token);
            console.log(" fetch token from the fitbit api - " + token.expires_in);
            console.log(" fetch token from the fitbit api - " + token.refresh_token);


            console.log(" fetch token from the fitbit api - " + client.getToken(token));

            if ( err ) return ( err );
            if(token)done();
        }, function (err) {
            console.log("error callback ....");
        });
    });
});
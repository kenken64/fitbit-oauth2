var should = require('chai').should();

var FitbitAPIoauth2 = require('fitbit-oauth2'),
        client = new FitbitAPIoauth2("dfc03f5cd3637a05939d2e47871b6532", "fefbcec6318feab8ad9cdb395b447e8b");

describe('test init', function() {

	it('initialize', function() {
        console.log(client);
    });
});

describe('test auth', function() {

    it('authorize', function() {
        console.log(client);

    });
});
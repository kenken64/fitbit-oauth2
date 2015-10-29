var FitbitAPIoauth2 = require('./lib/FitbitAPIoauth2');

module.exports = function (consumerKey,consumerSecret) {
  return FitbitAPIoauth2(consumerKey,consumerSecret);
};

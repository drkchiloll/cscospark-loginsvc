var Promise = require('bluebird'),
    request = require('request'),
    qs = require('qs'),
    config = require('./config');

// Constants
const initLoginUrl = 'https://idbroker.webex.com/idb/UI/Login';
const authUrl = 'https://idbroker.webex.com/idb/oauth2/v1/authorize';
const scopes = (
  `spark:memberships_write spark:memberships_read `+
  `spark:rooms_read spark:rooms_write `+
  `spark:messages_write spark:messages_read`
);

var sunQuery = () => {
  return new Buffer(qs.stringify({
    isCookie: false,
    fromGlobal: 'yes',
    realm: 'consumer',
    type: 'login',
    encodedParamString: 'dHlwZT1sb2dpbg==',
    gotoUrl: goToUrl(),
    email: config.user
  })).toString('base64');
};

var goToUrl = () => {
  return new Buffer(`${authUrl}?response_type=code&client_id=${config.id}`+
    `&redirect_uri=${encodeURIComponent(config.redirectUri)}`+
    `&scope=${encodeURIComponent(scopes)}`).toString('base64');
};

// console.log(sunQuery());
var qs = {
  IDToken0: '',
  IDToken1: config.user,
  IDToken2: config.pass,
  IDButton:'Sign+In',
  goto: goToUrl(),
  SunQueryParamsString: sunQuery(config.user),
  encoded:'true',
  loginid: config.user,
  isAudioCaptcha: 'false',
  gx_charset: 'UTF-8'
};

(() => {
  request({
    uri: initLoginUrl,
    qs: qs,
    jar: true
  }, function(err, resp, body) {
    console.log(resp.statusCode);
    console.log(body);
  });
}());

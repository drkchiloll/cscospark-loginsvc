var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio'),
    url = require('url'),
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

var idsTokForm = (code) => ({
    security_code : code,
    response_type: 'code',
    client_id: config.id,
    decision: 'accept'
});

var authQs = () => ({
    response_type: 'code',
    client_id: config.id,
    redirect_uri: config.redirectUri,
    service: 'webex-squared',
    scope: scopes
});

var axxTokForm = (code) => ({
    grant_type:'authorization_code',
    client_id: config.id,
    client_secret: config.secret,
    code: code,
    redirect_uri: config.redirectUri
});

(() => {
  request({
    uri: initLoginUrl,
    qs: qs,
    jar: true
  }, function(err, resp, body) {
    // console.log(body);
    var $ = cheerio.load(body);
    var tmpCode;
    tmpCode = $('input[type="hidden"]')
      .attr('name', 'security_code')
      .val();
    if(tmpCode.length === 64) {
      // Continue
      request.post({
        url: authUrl,
        jar: true,
        qs: authQs(),
        form: idsAuthForm(tmpCode)
      }, (err, res, body) => {
        var code = url.parse(res.headers.location)
          .query
          .replace(/\S+=/i, '');
        request.post({
          uri: 'https://api.ciscospark.com/v1/access_token',
          form: axxAuthForm(code),
        }, (err, res, body) => {
          console.log(body);
        })
      })
    } else {
      console.log('something went wrong');
    }
  });
}());

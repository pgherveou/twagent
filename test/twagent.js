var twagent = require('..')
, chai = require('chai')
, expect = chai.expect
, qs = require('querystring')
, callbackUrl = process.env.CALL_BACK_URL
, consumerKey = process.env.CONSUMER_KEY
, consumerSecret = process.env.CONSUMER_SECRET
, token = process.env.TOKEN
, tokenSecret = process.env.TOKEN_SECRET;

describe('twagent specs', function() {

  it('should return code 200 when posting to oauth/request_token', function(done) {
    twagent
      .post('oauth/request_token')
      .oauth('consumer_key', consumerKey)
      .oauth('callback', callbackUrl)
      .consumerSecret(consumerSecret)
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.be.ok;
        var data = qs.parse(res.text);
        expect(data).to.have.property('oauth_token');
        expect(data).to.have.property('oauth_token_secret');
        expect(data).to.have.property('oauth_callback_confirmed');
        done(err);
      });
  });

  it('should return code 200 when making an api get request', function(done) {
    twagent
      .get('1.1/followers/list.json')
      .oauth('consumer_key', consumerKey)
      .oauth('token', token)
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        done(err);
      });
  });

  it('should  get the auth url', function() {
    expect(twagent.authUrl('fake')).to.equal('https://api.twitter.com/oauth/authenticate?oauth_token=fake');
  });

});

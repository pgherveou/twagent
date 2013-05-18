var twagent = require('../lib')
, chai = require('chai')
, expect = chai.expect
, qs = require('querystring')
, callbackUrl = process.env.CALL_BACK_URL
, consumerKey = process.env.CONSUMER_KEY
, consumerSecret = process.env.CONSUMER_SECRET
, token = process.env.TOKEN
, tokenSecret = process.env.TOKEN_SECRET
, tweetId = "335793285580853250";

describe('twagent specs', function() {

  it('should post to oauth/request_token', function(done) {
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

  it('should make an api get request', function(done) {
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

  it('should post new status', function(done) {
    twagent
      .post('1.1/statuses/update.json')
      .data({status: "test tweet"})
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .oauth('token', token)
      .oauth('consumer_key', consumerKey)
      .end(function (res) {
        expect(res.statusCode).to.equal(200);
        tweetId = res.body.id_str;
        expect(tweetId).to.be.ok;
        done();
      });
  });

  it('should show new status', function(done) {
    twagent
      .get('1.1/statuses/show.json')
      .data({id: tweetId})
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .oauth('token', token)
      .oauth('consumer_key', consumerKey)
      .end(function (res) {
        // console.log(res.text, res.statusCode);
        expect(res.statusCode).to.equal(200);
        expect(res.body.id_str).to.eq(tweetId);
        done();
      });
  });

  it('should delete a status', function (done) {
    twagent
      .post('1.1/statuses/destroy/' + tweetId + '.json')
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .oauth('token', token)
      .oauth('consumer_key', consumerKey)
      .end(function (res) {
        // console.log(res.text);
        expect(res.statusCode).to.equal(200);
        done();
      });
  });

  it('should  get the auth url', function() {
    expect(twagent.authUrl('fake')).to.equal('https://api.twitter.com/oauth/authenticate?oauth_token=fake');
  });

});

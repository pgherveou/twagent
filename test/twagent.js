var twagent = require('..')
, chai = require('chai')
, expect = chai.expect
, callbackUrl = process.env.CALL_BACK_URL
, consumerKey = process.env.CONSUMER_KEY
, consumerSecret = process.env.CONSUMER_SECRET
, token = process.env.TOKEN
, tokenSecret = process.env.TOKEN_SECRET;

describe('twagent specs', function() {

  it('should return code 200 when posting to oauth/request_token', function(done) {
    twagent
      .post('oauth/request_token')
      .consumer(consumerKey, consumerSecret)
      .oauth('callback', callbackUrl)
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        done(err);
      });
  });

  it('should return code 200 when making an api get request', function(done) {
    twagent
      .get('1.1/followers/list.json')
      .consumer(consumerKey, consumerSecret)
      .token(token, tokenSecret)
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        done(err);
      });
  });


});

var twagent = require('../lib'),
    chai = require('chai'),
    expect = chai.expect,
    qs = require('querystring'),
    percentEncode = twagent._percentEncode,
    callbackUrl = process.env.CALL_BACK_URL,
    consumerKey = process.env.CONSUMER_KEY,
    consumerSecret = process.env.CONSUMER_SECRET,
    token = process.env.TOKEN,
    tokenSecret = process.env.TOKEN_SECRET,
    tweetId;


describe('twagent specs', function() {

  it('should percent encode strings', function() {
    expect(percentEncode('Ladies + Gentlemen')).to.eq('Ladies%20%2B%20Gentlemen');
    expect(percentEncode('An encoded string!')).to.eq('An%20encoded%20string%21');
    expect(percentEncode('Dogs, Cats & Mice')).to.eq('Dogs%2C%20Cats%20%26%20Mice');
    expect(percentEncode('☃')).to.eq('%E2%98%83');
  });

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
      .send({
        status: 'test !!!',
        lat: 37.80544394934271,
        long: -122.42786407470703,
      'display_coordinates': true
      })
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .oauth('token', token)
      .oauth('consumer_key', consumerKey)
      .end(function (res) {
        expect(res.statusCode).to.equal(200);
        expect(res.body.text).to.equal('test !!!');
        tweetId = res.body.id_str;
        expect(tweetId).to.be.ok;
        done();
      });
  });

  it('should get new status', function(done) {
    twagent
      .get('1.1/statuses/show.json')
      .query({ id: tweetId })
      .consumerSecret(consumerSecret)
      .tokenSecret(tokenSecret)
      .oauth('token', token)
      .oauth('consumer_key', consumerKey)
      .end(function (res) {
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
        expect(res.statusCode).to.equal(200);
        done();
      });
  });

  it('should  get the auth url', function() {
    expect(twagent.authUrl('fake')).to.equal('https://api.twitter.com/oauth/authenticate?oauth_token=fake');
  });

});

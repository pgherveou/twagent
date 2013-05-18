# twagent

thin wrapper on top of superagent to sign twitter request
inspired by similar facebook wrapper https://github.com/logicalparadox/fbagent

## Installation

    $ npm install twagent

## Example

### get follower list

```js
// use DEBUG=twagent to print signature header in console

twagent = require('twagent');
twagent
  .get('1.1/followers/list.json') // request type + api path
  .data({cursor:-1, screen_name: 'sitestreams'}) // query data
  .consumerSecret(consumerSecret) // set consumer credentials
  .oauth('consumer_key', consumerKey) // set oauth_consumer_key
  .oauth('token', token) // set oauth_token
  .tokenSecret(tokenSecret) // set token credentials
  .end(function (err, res) {
    console.log(res.body);
  });
```

### oauth signin flow

```js

app.get('tw-signin', function(req, res, next) {
  if (req.query.oauth_token && req.query.oauth_verifier) {
    twagent
      .post('oauth/access_token')
      .consumerSecret(process.env.CONSUMER_SECRET)
      .oauth('consumer_key', process.env.CONSUMER_KEY)
      .oauth('token', req.query.oauth_token)
      .data("oauth_verifier=" + req.query.oauth_verifier)
      .end(function(resp) {
        if (resp.error) return next('tw-connection-err');
        var data = qs.parse(resp.text)
        // do someting with tw credentials ...
        // data.user_id, data.oauth_token, data.oauth_token_secret
    });
  } else {
    var callbackUrl = req.host + req.url;
    twagent
      .post('oauth/request_token')
      .consumerSecret(PROCESS_ENV.CONSUMER_SECRET)
      .oauth('consumer_key', PROCESS_ENV.CONSUMER_KEY)
      .oauth('callback', callbackUrl)
      .end(function(resp) {
        if (resp.error) return next('tw-connection-err');
        var oauth_token = qs.parse(resp.text).oauth_token;
        res.redirect(twagent.authUrl(oauth_token));
    });
  }
});

```

## Api

### .consumerSecret(secret)

set consumer Secret

### .data(data)

set query string or request body

### .token(tokenSecret)

set token Secret

### .oauth(key, [value])

get or set oauth_<key> request header

### .authUrl(token)

build the oauth/authenticate url

## Test

    $ CONSUMER_KEY=... CONSUMER_SECRET=... TOKEN=... TOKEN_SECRET=... make test
# twagent

thin wrapper on top of superagent to sign twitter request

## Installation

    $ npm install twagent

## Usage

```js
// use DEBUG=tw to print signature header in console

twagent = require('twagent');
twagent
  .get('1.1/followers/list.json') // request type + api path
  .query({cursor:-1, screen_name: 'sitestreams'}) // query data (or send for post data)
  .oauth('consumer_key', consumerKey) // set oauth_consumer_key
  .oauth('token', token) // set oauth_token
  .consumerSecret(consumerSecret) // set consumer credentials
  .tokenSecret(tokenSecret) // set token credentials
  .end(function (err, res) {
    console.log(res.body);
  });
```



## Api

### .consumerSecret(secret)

set consumer Secret

### .token(tokenSecret)

set token Secret

### .oauth(key, [value])

get or set oauth_<key> request header

### .getUrl()

get full url with query string e.g 'https://api.twitter.com&foo=bar'

## Test

    $ CONSUMER_KEY=... CONSUMER_SECRET=... TOKEN=... TOKEN_SECRET=... make test
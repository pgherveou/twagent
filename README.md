# twagent

	thin wrapper on top of superagent to sign twitter request

## Installation

    $ npm install twagent

## Usage

```js
twagent = require('twagent');

twagent
  .get('1.1/followers/list.json')
  .query({cursor:-1, screen_name: 'sitestreams', skip_status: true, include_user_entities: false})
  .consumer(consumerKey, consumerSecret)
  .token(token, tokenSecret)
  .end(function (err, res) {
    console.log(res.body);
  });
```

## Api

### .consumer(consumerKey, [consumerSecret])

set consumer key & consumer Secret

### .token(token, [tokenSecret])

set token key & token Secret

### .oauth(key, value)

set oauth_<key> request header

## Test

    $ CONSUMER_KEY=... CONSUMER_SECRET=... TOKEN=... TOKEN_SECRET=... make test
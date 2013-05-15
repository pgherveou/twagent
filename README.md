# twagent

thin wrapper on top of superagent to sign twitter request

## Installation

    $ npm install twagent

## Usage

```js
twagent = require('twagent');

twagent
  .get('1.1/followers/list.json') // request type + api path
  .query({cursor:-1, screen_name: 'sitestreams', skip_status: true, include_user_entities: false}) // query (or send ) parameters
  .consumer(consumerKey, consumerSecret) // set consumer credentials
  .token(token, tokenSecret) // set token credentials
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

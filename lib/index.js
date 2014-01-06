var Request = require('superagent').Request,
    crypto = require('crypto'),
    log = require('debug')('twagent'),
    methods = require('methods'),
    qs = require('querystring'),
    rootUrl = 'https://api.twitter.com',
    identity = function (x) { return x; };

/**
 * merge src object to dest object using transform to encode keys and values
 *
 * @param  {Object}   dest
 * @param  {Object}   src
 * @param  {Function} transform
 * @return {Object}
 * @api private
 */

function merge(dest, src, transform) {
  if (arguments.length === 2) transform = identity;
  if (!dest) dest = {};
  Object.keys(src).forEach(function (key) {
    dest[transform(key)] = transform(src[key]);
  });
  return src;
}

/**
 * percentage encode a string
 * @param  {String} str
 * @return {String}
 *
 * @api private
 */

function percentEncode (str) {
  return encodeURIComponent(str || '')
    .replace(/\!/g, '%21')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Initialize a new TwAgent
 *
 * @param {[type]} method
 * @param {[type]} url
 * @api public
 */

function TwAgent(method, url) {
  if (url[0] !== '/') url = '/' + url;
  Request.call(this, method, rootUrl + url);
  this._oauthParams = {};
  this._params = {};
  this.oauth('signature_method', 'HMAC-SHA1');
  this.oauth('version', '1.0' );
}

/*!
 * inherit request
 */

TwAgent.prototype.__proto__ = Request.prototype;

/**
 * store params
 */

TwAgent.prototype.params = function(val) {
  if ('string' === typeof val) {
    merge(this._params, qs.parse(val));
  } else {
    merge(this._params, val);
  }
  return this;
};

/**
 * override query
 */

TwAgent.prototype.query = function(val) {
  this.params(val);
  return Request.prototype.query.call(this, val);
};

/**
 * override send
 */

TwAgent.prototype.send = function(val) {
  var status = '',
      dataStr;

  // make sure we have an object
  if ('string' === typeof val) val = qs.parse(val);

  // status needs to be percentEncoded
  if (val.status) {
    status = 'status=' + percentEncode(val.status);
    delete val.status;
  }

  // rebuild data string
  dataStr = qs.stringify(val);
  if (dataStr)  {
    dataStr += '&' + status;
  } else {
    dataStr = status;
  }

  // add params
  this.params(dataStr);

  // add post data
  return Request.prototype.send.call(this, dataStr);
};

/**
 * get or set oauth parameter
 * @param {String}    key
 * @param {[String]}  value
 * @return {String|TwAgent}
 *
 * @api public
 */

TwAgent.prototype.oauth = function(key, value) {
  if (arguments.length === 1) {
    return this._oauthParams['oauth_' + key];
  }
  this._oauthParams['oauth_' + key] = value;
  return this;
};

/**
 * set consumer secret
 * @param {String}  secret
 * @return {TwAgent}
 *
 * @api public
 */

TwAgent.prototype.consumerSecret = function(secret) {
  this._consumerSecret = secret;
  return this;
};

/**
 * set token secret
 * @param {String}  secret
 * @return {String|TwAgent}
 *
 * @api public
 */

TwAgent.prototype.tokenSecret = function(secret) {
  this._tokenSecret = secret;
  return this;
};


/**
 * initiate request
 *
 * @see https://dev.twitter.com/docs/auth/creating-signature
 * @see https://dev.twitter.com/docs/auth/authorizing-request
 * @return {TwAgent}
 * @api public
 */

TwAgent.prototype.end = function() {
  var params = {},
      _this = this;

  this.oauth('nonce', crypto.randomBytes(21).toString('hex'));
  this.oauth('timestamp',  Math.round(Date.now() / 1000));

  // create params string
  merge(params, this._oauthParams, percentEncode);
  merge(params, this._params, percentEncode);
  var paramStr = Object
    .keys(params)
    .map(function (key) {
      return key + '=' + params[key];
    })
    .sort()
    .join('&');

  var sigStr = [
    this.method.toUpperCase(),
    percentEncode(this.url),
    percentEncode(paramStr)
  ].join('&');

  var sigKey = [
    percentEncode(this._consumerSecret),
    this._tokenSecret ? percentEncode(this._tokenSecret) : ''
  ].join('&');

  var sig = crypto
    .createHmac('sha1', sigKey)
    .update(sigStr)
    .digest('base64');

  this.oauth('signature', sig);

  var oauthVal = Object
    .keys(this._oauthParams)
    .sort()
    .map(function (key) {return percentEncode(key) + '="' + percentEncode(_this._oauthParams[key]) + '"';})
    .join(', ');

  log('url: ', this.url);
  log('\n=== parameter base string ===\n' + paramStr);
  log('\n=== Signature base string ===\n' + sigStr);
  log('\n=== Authorization header ===\n' + oauthVal.split(', ').join(',\n'));

  this.set('Authorization', 'OAuth ' + oauthVal);
  return Request.prototype.end.apply(this, arguments);
};

/**
 * issue a request
 * @param  {[String]} url
 */

function twagent(method, url) {

  // callback
  if ('function' === typeof url) {
    return new TwAgent('GET', method).end(url);
  }

  // url first
  if (1 === arguments.length) {
    return new TwAgent('GET', method);
  }

  return new TwAgent(method, url);
}

// generate HTTP verb methods

methods.forEach(function(method) {
  var name = ('delete' === method)
    ? 'del'
    : method;

  method = method.toUpperCase();
  twagent[name] = function(url, fn) {
    var req = twagent(method, url);
    if (fn) req.end(fn);
    return req;
  };
});

/**
 * Expose the twagent function.
 */

module.exports = twagent;

/**
 * get the full authenticate url
 *
 * @param  {String} token oauth_token to append to the url query string
 * @return {String}
 * @api public
 */

twagent.authUrl = function(token) {
  return rootUrl + '/oauth/authenticate?oauth_token=' + token;
};

// expose for testing purpose
twagent._percentEncode = percentEncode;

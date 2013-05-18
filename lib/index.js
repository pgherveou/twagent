var Request = require('superagent').Request
  , util = require('util')
  , crypto = require('crypto')
  , log = require('debug')('tw')
  , methods = require('methods')
  , qs = require('querystring')
  , rootUrl = 'https://api.twitter.com'
  , identity = function (x) {return x;};

/**
 * Expose the twagent function.
 */

exports = module.exports = twagent;


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
  if (arguments.length == 2) transform = identity;
  if (!dest) dest = {};
  Object.keys(src).forEach(function (key) {
    dest[transform(key)] = transform(src[key]);
  });
  return src;
}

/**
 * Initialize a new TwAgent
 *
 * @param {[type]} method
 * @param {[type]} url
 * @api public
 */

function TwAgent(method, url) {
  if (url[0] != '/') url = '/' + url;
  Request.call(this, method, rootUrl + url);
  this._oauthParams = {};
  this.oauth('signature_method', 'HMAC-SHA1');
  this.oauth('version', "1.0" );
}

/**
 * inherit request
 */

TwAgent.prototype.__proto__ = Request.prototype;

/**
 * get or set oauth parameter
 * @param {String}    key
 * @param {[String]}  value
 * @return {String|TwAgent}
 *
 * @api public
 */

TwAgent.prototype.oauth = function(key, value) {
  if (arguments.length == 1) {
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
 * set body data
 * @param  {Object} data
 * @return {TwAgent}
 *
 * @api public
 */

TwAgent.prototype.send = function(data) {
  var body;
  if ('string' == typeof data)
    body = qs.parse(data);
  else
    body = data || {};

  merge((this._body || (this._body = {})), body);
  return Request.prototype.send.call(this, data);
};

/**
 * set query data
 * @param  {Object} data
 * @return {TwAgent}
 *
 * @api public
 */

TwAgent.prototype.query = function(data) {
  var query;
  if ('string' == typeof data)
    query = qs.parse(data);
  else
    query = data || {};

  merge((this._query || (this._query = {})), query);
  return Request.prototype.query.call(this, data);
};

/**
 * initiate request
 *
 * @return {TwAgent}
 * @api public
 */

TwAgent.prototype.end = function() {
  var params = {}
    , self = this;

  this.oauth('nonce', crypto.randomBytes(21).toString('hex'));
  this.oauth('timestamp',  Math.round(Date.now() / 1000));

  merge(params, this._oauthParams, percentEncode);
  if (this._query) merge(params, this._query, percentEncode);
  if (this._body) merge(params, this._body, percentEncode);

  var paramStr = Object
    .keys(params)
    .sort()
    .map(function (key) {return key + '=' + params[key];})
    .join('&');

  var sigStr = [
    this.method,
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
    .map(function (key) {return percentEncode(key) + '="' + percentEncode(self._oauthParams[key]) + '"';})
    .join(', ');

  log('\n=== header ===\n' + oauthVal.split(', ').join(',\n') + '\n=== header ===');

  this.set('Authorization', 'OAuth ' + oauthVal);
  return Request.prototype.end.apply(this, arguments);
};

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
 * issue a request
 * @param  {[String]} url
 */

function twagent(method, url) {
  // callback
  if ('function' == typeof url) {
    return new TwAgent('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new TwAgent('GET', method);
  }

  return new TwAgent(method, url);
}

// generate HTTP verb methods

methods.forEach(function(method) {
  var name = 'delete' == method
    ? 'del'
    : method;

  method = method.toUpperCase();
  twagent[name] = function(url, fn) {
    var req = twagent(method, url);
    fn && req.end(fn);
    return req;
  };
});

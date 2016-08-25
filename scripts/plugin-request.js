var request = require('request');
var fs = require('fs');
var url = require('url');
var Q = require('q');
var util = require('util');

var sessionHeaders;

exports.get = function(filePath) {
  var defer = Q.defer;
  fs.readFile(filePath, function (err, buf) {
    if (err) defer.reject(err);
    else defer.resolve(buf.toString());
  });
  return defer.promise;
}

function getSessionHeaders(config, log) {
  var defer = Q.defer();
  if (sessionHeaders) defer.resolve(sessionHeaders);
  else {
    var body = `username=${config.username}&password=${config.password}`;
    log('Session Request Configuration', {url: 'http://localhost:8080/cxp/login', method: 'POST'});
    // can we use head method?
    request({
        url: 'http://localhost:8080/cxp/login',
        method: 'POST',
        body: body,
        headers: Object.assign(config.headers, {'Content-Type': 'application/x-www-form-urlencoded'}),
      }, function(err, res) {
      if (err) defer.reject(err);
      else {
        sessionHeaders = {
          Cookie: res.headers['set-cookie']
        }
        const csrf = res.headers['x-bbxsrf'];
        if (csrf) sessionHeaders['X-BBXSRF'] = csrf;

        defer.resolve(sessionHeaders);
      }
    });
  }
  return defer.promise;
}
function parseResponse(res, isDownload) {
  return {
    status: res.statusCode,
    statusText: res.statusMessage,
    headers: res.headers,
    body: isDownload ? '' : res.body.toString()
  };
}

/**
 * config properties:
 * url - string - url to call
 * method - string - http method
 * query - object - query hash
 * headers - object - headers hash
 * body - string - body to send
 * username - string - username
 * password - string - password
 * file - string - file path for upload/download
 * upload - string - name of the form field for upload
 * download - boolean - true if response is stream to download
 */
exports.request = function(config, log) {
  return getSessionHeaders(config, log)
  .then(function(headers) {
    Object.assign(config.headers, headers);

    var options = {
      method: config.method,
      uri: config.url,
      headers: config.headers,
      body: config.body
    }
    log('Request Configuration', config);
    if (config.file && !config.download) {
      options.formData = {};
      options.formData[config.upload] = fs.createReadStream(config.file);
    }
    
    var defer = Q.defer();

    var req = request(options,
      function(err, res) {
        if (err) defer.reject(err);
        else {
          defer.resolve(parseResponse(res, config.download));
        }
      }
    );
    if (config.download) req.pipe(fs.createWriteStream(config.file));
    return defer.promise;
  });
}

exports.urlParse = function(urlString) {
  return url.parse(urlString, true);
}

exports.log = function(title, obj) {
  console.log('\n-------------------------\n' + title + '\n-------------------------');
  console.log(util.inspect(obj, {
    depth: 4,
    colors: true
  }));  
}


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

function parseResponse(res, isDownload) {
  var out = {
    status: res.statusCode,
    statusText: res.statusMessage,
    headers: res.headers,
    body: isDownload ? '' : res.body.toString()
  };
  return out;
}

/**
 * config properties:
 * url - string - url to call
 * method - string - http method
 * query - object - query hash
 * headers - object - headers hash
 * body - string - body to send
 * importFile - string - file path for upload
 * exportFile - string - file path for download
 * upload - string - name of the form field for upload
 */
exports.request = function(config, log) {
  var defer = Q.defer();

  var options = {
    uri: config.url,
    method: config.method,
    headers: config.headers,
    body: config.body,
    qs: config.query
  }

  if (config.importFile) {
    log('Request Configuration', Object.assign({}, options, { formData: config.importFile }));
    options.formData = {};
    options.formData[config.upload] = fs.createReadStream(config.importFile);
  } else {
    log('Request Configuration', options);
  }
  

  var req = request(options,
    function(err, res) {
      if (err) defer.reject(err);
      else {
        defer.resolve(parseResponse(res, config.hasOwnProperty('exportFile')));
      }
    }
  );
  if (config.exportFile) req.pipe(fs.createWriteStream(config.exportFile));

  return defer.promise;
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

exports.btoa = function(str) {
  return new Buffer(str, 'utf8').toString('base64');
}  

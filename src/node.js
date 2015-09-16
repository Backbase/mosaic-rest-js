/*global require exports */
var request = require('request');
var Q = require('q');
var fs = require('fs');
var readFile = Q.denodeify(fs.readFile);
var EventEmitter = require('events');

exports.get = function(path) {
    return readFile(path)
    .then(function(file) {
        return file.toString();
    });
};

// url: this.getUri(),
// method: this.method,
// query: this.qs,
// headers: this.headers,
// payload: (inp === 'jxon') ? jxon.jsToString(d) : d,
// username: this.config.username,
// password: this.config.password,
// file: this.targetFile
exports.request = function(o) {
    var requestOpts = {
        method: o.method,
        url: o.url,
        qs: o.query,
        body: o.payload,
        headers: o.headers
    };
    if (o.username !== null) {
        requestOpts.auth = {
            username: o.username,
            password: o.password
        };
    }
    if (o.file && o.method === 'POST') {
        var importType = o.url.indexOf('import/package') === -1 ? 'file' : 'package';
        requestOpts.formData = {};
        if (o.file instanceof EventEmitter) requestOpts.formData[importType] = o.file;
        else requestOpts.formData[importType] = fs.createReadStream(o.file);
    }

    return executeRequest(requestOpts, o.file);
};

function executeRequest(opts, file) {
    var defer = Q.defer();
    var req = request(opts, function(err, res) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve({
                method: res.request.method,
                href: res.request.href,
                statusCode: parseInt(res.statusCode),
                statusInfo: res.request.httpModule.STATUS_CODES[res.statusCode],
                headers: res.headers,
                body: res.body.toString(),
                reqBody: opts.body,
                file: file || null
            });
        }
    });

    if (file && opts.method === 'GET') {
        if (opts.url.indexOf('export') !== -1) {
            if (file instanceof EventEmitter) req.pipe(file);
            else req.pipe(fs.createWriteStream(file));
        }
    }
    return defer.promise;
}


/*global jxon, p1, p2, require, BBRest, BBReq, module, unescape*/
var request = p1;
var Q = p2;
var fs = require('fs');
var readFile = Q.denodeify(fs.readFile);

function getUri(cnf, uri) {
    return 'http://' +
    cnf.host + ':' +
    cnf.port + '/' +
    cnf.context + '/' +
    uri.join('/');
}

function getRequest(uri, o) {
    var reqP = {
            uri: uri,
            qs: o.qs,
            method: o.method,
            headers: o.headers
        };

    if (o.config.username !== null) {
        reqP.auth = {
            username: o.config.username,
            password: o.config.password
        };
    }
    if (o.targetFile) {
        if (o.method === 'POST') {
            reqP.formData = {
                file: fs.createReadStream(o.targetFile)
            };
        }
    }
    return reqP;
}

function parseResponse(p, t) {
    var o = {
        statusCode: parseInt(p.statusCode),
        statusInfo: p.request.httpModule.STATUS_CODES[p.statusCode],
        href: p.request.href,
        method: p.request.method,
        headers: p.headers,
        file: t.file || null
    }, es;

    if (typeof p.body !== 'undefined') o.body = p.body.toString();

    if (o.statusCode >= 400) o.error = true;
    else if (o.statusCode === 302) {
        // if server redirects to error page, set message as error
        es = o.headers.location.indexOf('errorMessage=');
        if (es !== -1) o.error = unescape(o.headers.location.substr(es + 13));
    } else if (t.config.plugin && o.body) {
        o.body = t.config.plugin(o.body);
    }
    // on get method if server redirects to error page, set message as error
    es = o.href.indexOf('errorMessage=');
    if (es !== -1) o.error = unescape(o.href.substr(es + 13));
    return o;
}

function parseError(t) {
    return {
        error: true,
        statusCode: null,
        statusInfo: 'Request failed',
        body: null,
        method: t.method,
        file: t.targetFile || null
    };
}

BBReq.prototype.req = function(data) {
    var r,
        t = this,
        defer = Q.defer(),
	uri = getUri(this.config, this.uri),
        reqP = getRequest(uri, this);

    reqP.body = data || '';

    var req = request(reqP, function(err, p, dta) {
        r = parseResponse(p, t);
        if (!t.targetFile && r.body && t.config.toJs) r.body = stringToJs(r.body);
        r.reqBody = data;
        defer.resolve(r);
    })
    .on('error', function() {
        r = parseError(t);
        r.reqBody = data;
        r.uri = uri;
        defer.reject(r);
    });

    if (this.targetFile && this.uri[1] === 'export') {
        req.pipe(fs.createWriteStream(this.targetFile));
    }
    return defer.promise;
};

function getRequestBody(inp, plugin) {
    switch (typeof inp) {
        case 'string':
            return readFile(inp)
            .then(function(d) {
                return d.toString();
            })
            .fail(function() {
                return {
                    error: true,
                    info: 'File path is wrong'
                };
            });
        case 'object':
            return Q(plugin(inp));
        default:
            return Q(inp);
    }
}

function stringToJs(s) {
    return jxon.stringToJs(s);
}


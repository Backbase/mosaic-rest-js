var request = require('request'),
    Q = require('q'),
    readFile = Q.denodeify(require('fs').readFile),
    qReq = Q.denodeify(request);

module.exports = BBRest;
BBReq.prototype.req = function(data) {
    var t = this,
	uri = 'http://' + 
	      this.config.host + ':' +
	      this.config.port + '/' +
	      this.config.context + '/' +
	      this.uri.join('/');

    return qReq({
	auth: {
	    username: this.config.username,
	    password: this.config.password
	},
	uri: uri,
	qs: this.qs,
	method: this.method,
	headers: this.headers,
	body: data || ''
    })
    .then(function(p) {
	var o = {
	    statusCode: parseInt(p[0].statusCode),
	    info: p[0].request.httpModule.STATUS_CODES[p[0].statusCode],
	    body: p[0].body,
	    href: p[0].request.href,
	    method: p[0].request.method,
	    reqBody: data,
            headers: p[0].headers,
	    file: t.file || null
	};
	if (o.statusCode >= 400) o.error = true;
	else {
	}
	return o;
    })
    .fail(function(p) {
	return {
	    error: true,
	    statusCode: null,
	    info: 'Request failed',
	    body: null,
	    href: uri,
	    method: t.method,
	    reqBody: data,
	    file: t.file || null
	};
    }); 
};

BBReq.prototype.parseInput = function(inp, params) {
    var t = this;
    switch (typeof inp) {
        case 'string':
            this.file = inp;
            return readFile(inp)
            .then(function(d) {
                return t.req(d.toString());
            })
            .fail(function(p) {
                return {
                    error: true,
                    info: 'File path is wrong'
                };
            });
            break;
        case 'function':
            return inp.apply(t, params);
            break;
        default:
	    return this.req();
    }
};


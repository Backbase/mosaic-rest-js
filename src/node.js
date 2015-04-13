var request = require('request'),
    Q = require('q'),
    jxon = require('jxon'),
    readFile = Q.denodeify(require('fs').readFile),
    qReq = Q.denodeify(request);

jxon.config({
  valueKey: "_",
  attrKey: "$",
  attrPrefix: "$",
  lowerCaseTags: false,
  trueIsEmpty: false,
  autoDate: false,
  ignorePrefixedNodes: false
});

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
	    statusInfo: p[0].request.httpModule.STATUS_CODES[p[0].statusCode],
	    body: p[0].body,
	    href: p[0].request.href,
	    method: p[0].request.method,
	    reqBody: data,
            headers: p[0].headers,
	    file: t.file || null
	};
	if (o.statusCode >= 400) o.error = true;
	else if (o.statusCode === 302) {
            // if server redirects to error page, set message as error
            var es = o.headers.location.indexOf('errorMessage=');
            if (es !== -1) o.error = unescape(o.headers.location.substr(es + 13));
	} else if (t.config.plugin && o.body) {
            o.body = t.config.plugin(o.body);
        }
        // on get method if server redirects to error page, set message as error
        var es = o.href.indexOf('errorMessage=');
        if (es !== -1) o.error = unescape(o.href.substr(es + 13));
	return o;
    })
    .fail(function(p) {
	return {
	    error: true,
	    statusCode: null,
	    statusInfo: 'Request failed',
	    body: null,
	    href: uri,
	    method: t.method,
	    reqBody: data,
	    file: t.file || null
	};
    });
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
            break;
        case 'object':
            return Q(plugin(inp));
        default:
            return Q(inp);
    }
};

function stringToJs(s) {
    return jxon.stringToJs(s);
}



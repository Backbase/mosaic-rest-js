var $, jxon, stringToJs;

if ( typeof define === "function" && define.amd ) {
    define( ['jquery', 'jxon'], function (jQuery, jx) { 
        $ = jQuery;
        jxon = jx;
        initJxon();
        return BBRest; 
    } );
} else {
    $ = jQuery;
    jxon = JXON;
    initJxon();
    window.BBRest = BBRest;
}

function initJxon() {
    jxon.config({
      valueKey: "_",        // default: 'keyValue'
      attrKey: "$",         // default: 'keyAttributes'
      attrPrefix: "$",      // default: '@'
      lowerCaseTags: false, // default: true
      trueIsEmpty: false,   // default: true
      autoDate: false,      // default: true
      ignorePrefixedNodes: false // default: true
    });
}

BBReq.prototype.req = function(data) {
    var t = this,
	uri = 'http://' + 
	      this.config.host + ':' +
	      this.config.port + '/' +
	      this.config.context + '/' +
	      this.uri.join('/'),
        qs = $.param(this.qs);

    if (qs) uri += '?' + qs;
    this.headers['Authorization'] = "Basic " + btoa(this.config.username + ":" + this.config.password);

    return $.ajax({
	type: this.method,
	url: uri,
        dataType: 'xml',
	headers: this.headers,
	data: data || ''
    })
    .then(function(p, s, j) {
        var o = {
	    statusCode: parseInt(j.status),
	    statusInfo: j.statusCode,
	    body: j.responseText,
	    href: uri,
	    method: t.method,
	    reqBody: data
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
	    ststusInfo: 'Request failed',
	    body: null,
	    href: uri,
	    method: t.method,
	    reqBody: data,
	    file: t.file || null
	};
    }); 
};

// input default is url with xml
function getRequestBody(inp, func) {
    var t = this;
    switch (typeof inp) {
        case 'string':
            return $.ajax({
                type: 'GET',
                dataType: 'text',
                url: inp
            })
            .fail(function(p) {
                return {
                    error: true,
                    info: 'Wrong URL'
                };
            });
            break;
        case 'object':
            var d = new $.Deferred();
            d.resolve(func(inp));
            return d.promise();
        default:
            var d = new $.Deferred();
            d.resolve(inp);
            return d.promise();
    }
};

function stringToJs(s) {
    return jxon.stringToJs(s);
}

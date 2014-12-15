var $;

if ( typeof define === "function" && define.amd ) {
    define( ['jquery'], function (jQuery) { 
        $ = jQuery;
        return BBRest; 
    } );
} else {
    $ = jQuery;
    window.BBRest = BBRest;
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
	    info: j.statusCode,
	    body: j.responseText,
	    href: uri,
	    method: t.method,
	    reqBody: data
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

// input default is url with xml
BBReq.prototype.parseInput = function(inp, params) {
    var t = this;
    switch (typeof inp) {
        case 'string':
            return $.ajax({
                type: 'GET',
                dataType: 'text',
                url: inp
            })
            .then(function(d) {
                return t.req(d);
            })
            .fail(function(p) {
                return {
                    error: true,
                    info: 'Wrong URL'
                };
            });
            break;
        case 'function':
            return this.req(inp(this, params));
            break;
        default:
	    return this.req();
    }
};



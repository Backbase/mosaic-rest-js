/*global define, jQuery, jxon, p1, BBRest, BBReq, btoa*/
'use strict';
var ng = p1;
var ngHttp = ng.injector(['ng']).get('$http');
var ngQ = ng.injector(['ng']).get('$q');


// ng.injector(['ng']).invoke(function($http, $q) {
//     ngHttp = $http;
//     ngQ = $q;
// });

BBReq.prototype.req = function(data) {
    //throw new Error(typeof ngHttp.get);
    var t = this,
	uri = this.getUri();

    if (this.config.username !== null) {
        this.headers.Authorization = 'Basic ' + btoa(this.config.username + ':' + this.config.password);
    }

    return ngHttp({
        method: this.method,
        url: uri,
        data: data || '',
        params: this.qs,
        headers: this.headers
    })
    .then(function(d) {
        var o = {
            statusCode: d.status,
            statusInfo: d.statusText,
            body: d.data,
            href: uri,
            method: t.method,
            reqBody: data
        }, es;
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
    })
    .catch(function(e) {
	return {
            error: true,
            statusCode: e.status,
            ststusInfo: e.statusText,
            body: e.data,
            href: uri,
            method: t.method,
            reqBody: data,
            file: t.file || null
	};
    });
};

// input default is url with xml
function getRequestBody(inp, func) {
    var d;
    switch (typeof inp) {
        case 'string':
            return ngHttp.get(inp)
            .then(function(d) {
                return d.data;
            })
            .catch(function() {
                return {
                    error: true,
                    info: 'Wrong URL'
                };
            });
        case 'object':
            d = ngQ.defer();
            d.resolve(func(inp));
            return d.promise;
        default:
            d = ngQ.defer();
            d.resolve(inp);
            return d.promise;
    }
}

function stringToJs(s) {
    return jxon.stringToJs(s);
}


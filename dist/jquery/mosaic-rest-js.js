/*global define, module, require, JXON, getRequestBody, stringToJs*/

(function (root, factory) {
'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jxon', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jxon'), require('request'), require('q'));
    } else {
        // Browser globals (root is window)
        root.BBRest = factory(JXON, jQuery);
    }
}(this, function (jxon, p1, p2) {
'use strict';

    // do not change to single quotes! gulp-file-include is not working with single quotes
    jxon.config({
      valueKey: "_",
      attrKey: "$",
      attrPrefix: "$",
      lowerCaseTags: false,
      trueIsEmpty: false,
      autoDate: false,
      ignorePrefixedNodes: false
    });

    function extend() {
	var i, j, a = arguments;
	for (i = 1; i < a.length; i++) {
            for (j in a[i]) a[0][j] = a[i][j];
	}
	return a[0];
    }

    function BBRest(cnf) {
	this.config = extend({
            host: 'localhost',
            port: '7777',
            context: 'portalserver',
            username: 'admin',
            password: 'admin', // TODO: do not expose password for frontend version
            plugin: null,
            portal: null
	}, cnf || {});
    }

    extend(BBRest.prototype, {
	server: function() {
            return new BBReq('server', this.config, ['portals']);
	},
	portal: function() {
            var a = ['portals', this.config.portal];
            return new BBReq('portal', this.config, a);
	},
        catalog: function(item) {
            var a = ['catalog'];
            if (item) a.push(item);
            return new BBReq('server', this.config, a);
        },
        portalCatalog: function(item) {
            var a = ['portals', this.config.portal, 'catalog'];
            if (item) a.push(item);
            return new BBReq('portal', this.config, a);
        },
	container: function(containerName) {
            var a = ['portals', this.config.portal, 'containers'];
            if (containerName) a.push(containerName);
            return new BBReq('container', this.config, a);
	},
	widget: function(widgetName) {
            var a = ['portals', this.config.portal, 'widgets'];
            if (widgetName) a.push(widgetName);
            return new BBReq('widget', this.config, a);
	},
	page: function(pageName) {
            var a = ['portals', this.config.portal, 'pages'];
            if (pageName) a.push(pageName);
            return new BBReq('page', this.config, a);
	},
	link: function(linkName) {
            var a = ['portals', this.config.portal, 'links'];
            if (linkName) a.push(linkName);
            return new BBReq('link', this.config, a);
	},
	user: function(userName, showGroups, groupName) {
            var a = ['users'];
            if (userName) a.push(userName);
            if (showGroups) a.push('groups');
            if (groupName) a.push(groupName);
            return new BBReq('user', this.config, a);
	},
	group: function(groupName, showUsers, userName) {
            var a = ['groups'];
            if (groupName) a.push(groupName);
            if (showUsers) a.push('users');
            if (userName) a.push(userName);
            return new BBReq('group', this.config, a);
	},
	template: function(templateName) {
            var a = ['templates'];
            if (templateName) a.push(templateName);
            return new BBReq('template', this.config, a);
	},
	audit: function(meta) {
            return new BBReq('audit', this.config, [meta ? 'auditmeta' : 'auditevents']);
	},
	cache: function(type) {
            var a = ['caches', type];
            return new BBReq('cache', this.config, a);
	},
	import: function() {
	},
	export: function() {
	},
        auto: function(d, method) {
            var t = this;
            return getRequestBody(d, this.config.plugin).then(function(r) {
                if (typeof r === 'string') r = stringToJs(r);
                var a = t.jxonToObj(r, method);
                return t[a[0]]()[a[1]](d);
            });
        },
        jxonToObj: function(j, method) {
            var aKey, bKey, plural, context, a = [],
                items = ['container', 'widget', 'page', 'link', 'template', 'user', 'group'];
            for (aKey in j) {
                for (bKey in j[aKey]) break;
                context = j[aKey][bKey].contextItemName;

                switch (aKey) {
                    case 'catalog':
                        if (context === '[BBHOST]') a.push('catalog', 'post');
                        else a.push('portalCatalog', 'post');
                        break;
                    case 'portals':
                        a.push('server', 'post');
                        break;
                    case 'portal':
                        a.push('server', 'put');
                        break;
                    default:
                        plural = aKey.charAt(aKey.length - 1) === 's';
                        if (plural) {
                            if (aKey.substr(0, aKey.length - 1) === bKey) {
                                a.push(bKey, 'post');
                            } else {
                                throw new Error(aKey + ' must be plural of ' + bKey);
                            }
                        } else {
                            if (items.indexOf(aKey) !== -1) a.push(aKey, 'put');
                            else a.push(aKey, 'post');
                        }
                        break;
                }
                break;
            }
            if (method) a[1] = method;
            return a;
        }

    });

    function BBReq(cmnd, cnf, uri) {
	this.command = cmnd;
	this.config = extend({}, cnf);
	this.uri = uri;
	this.qs = {};
	this.headers = {
            'Content-Type': 'application/xml'
	};
    }

    extend(BBReq.prototype, {
	rights: function() {
            this.uri.push('rights');
            return this;
	},
	tag: function(tagName, tagType) {
            this.uri.push('tags');
            if (tagName) this.uri.push(tagName);
            if (tagType) this.qs.type = tagType;
            return this;
	},
	query: function(o) {
            this.qs = o;
            return this;
	},
	get: function() {
            /* methods that use .xml:
             * portal().xml().get()
             * portalCatalog('item').get()
             * container('name').xml().get()
             * widget('name').xml().get()
             * page('name').xml().get()
             * link('name').xml().get() */
            if (this.uri[0] === 'portals' && this.uri.length === 2) this.uri[1] += '.xml';
            if (this.uri[2] === 'catalog' && this.uri[3]) this.uri[3] += '.xml';
            if (this.uri[2] === 'pages' && this.uri[3]) this.uri[3] += '.xml';
            if (this.uri[2] === 'containers' && this.uri[3]) this.uri[3] += '.xml';
            if (this.uri[2] === 'widgets' && this.uri[3]) this.uri[3] += '.xml';
            if (this.uri[2] === 'links' && this.uri[3]) this.uri[3] += '.xml';
            this.method = 'GET';
            return this.req();
	},
	post: function(d) {
            this.method = 'POST';
            return this.doRequest(d);
	},
	put: function(d) {
            this.method = 'PUT';
            return this.doRequest(d);
	},
	// fixing inconsistencies in API
	// server /delete/catalog POST
	// portal /portals/[portal_name]/delete/catalog POST
	// link /portals/[portal_name]/delete/links POST
	delete: function(v) {
            this.method = 'DELETE';
            if (v) {
		this.method = 'POST';
		switch (this.command) {
                    case 'server':
			this.uri = ['delete', 'catalog'];
			break;
                    case 'portal':
			this.uri[2] = 'delete';
			this.uri[3] = 'catalog';
			break;
                    case 'link':
			this.uri[2] = 'delete';
			this.uri[3] = 'links';
			break;
                    default:
                       // code
		}
            }
            if (this.command === 'cache' && this.uri[1] === 'all') {
                return this.deleteAllCache(0);
            }
            return this.doRequest(v);
	},
        doRequest: function(d) {
            var t = this;
            return getRequestBody(d, this.config.plugin).then(function(r) {
                return t.req(r);
            });
        },
        deleteAllCache: function(i) {
            var t = this;
            this.uri[1] = cch[i];
            return this.req().then(function(v) {
                if (!v.error && i < cch.length - 1) return t.deleteAllCache(++i);
                return v;
            });
        }
    });

var cch = ['globalModelCache',
        'retrievedWidgetCache',
        'widgetChromeStaticCache',
        'serverSideClosureCache',
        'urlLevelCache',
        //'webCache',
        'gModelCache',
        'uuidFromExtendedItemNamesCache',
        'springAclSidCacheRegion',
        'contextNameToItemNameToUuidCache',
        'widgetCache',
        'uuidToContentReferencesCache',
        'springAclCacheRegion',
        'itemUuidToReferencingLinkUuidsCache',
        'uuidToCacheKeysCache',
        'versionBundleCache'];

/*global define, jQuery, jxon, p1, BBRest, BBReq, btoa*/
'use strict';
var $ = p1;

BBReq.prototype.req = function(data) {
    var t = this,
	uri = 'http://' +
            this.config.host + ':' +
            this.config.port + '/' +
            this.config.context + '/' +
            this.uri.join('/'),
        qs = $.param(this.qs);

    if (qs) uri += '?' + qs;
    if (this.config.username !== null) {
        this.headers.Authorization = 'Basic ' + btoa(this.config.username + ':' + this.config.password);
    }

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
    .fail(function() {
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
    var d;
    switch (typeof inp) {
        case 'string':
            return $.ajax({
                type: 'GET',
                dataType: 'text',
                url: inp
            })
            .fail(function() {
                return {
                    error: true,
                    info: 'Wrong URL'
                };
            });
        case 'object':
            d = new $.Deferred();
            d.resolve(func(inp));
            return d.promise();
        default:
            d = new $.Deferred();
            d.resolve(inp);
            return d.promise();
    }
}

function stringToJs(s) {
    return jxon.stringToJs(s);
}



return BBRest;
}));

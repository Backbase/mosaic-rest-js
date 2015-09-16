/*global define, module, require, JXON, getRequestBody, stringToJs*/

(function (root, factory) {
'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jxon', 'bbrest-plugin'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jxon'), require('./node'));
    } else {
        // Browser globals (root is window)
        root.BBRest = factory(root.JXON, root.BBRestPlugin);
    }
}(this, function (jxon, plugin) {
'use strict';

    jxon.config({
        valueKey: '_',
        attrKey: '$',
        attrPrefix: '$',
        lowerCaseTags: false,
        trueIsEmpty: false,
        autoDate: false,
        ignorePrefixedNodes: false,
        parseValues: false
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
            scheme: 'http',
            host: 'localhost',
            port: '7777',
            context: 'portalserver',
            username: 'admin',
            password: 'admin',
            portal: null,
            outputJxon: true,
            plugin: plugin
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
            var a = ['import', 'portal'];
            return new BBReq('import', this.config, a);
	},
	importItem: function(toPortal) {
            var a = ['import', 'package'];
            if (toPortal) a.push(this.config.portal);
            return new BBReq('importItem', this.config, a);
	},
	export: function(uuid) {
            var a;
            if (uuid) {
                a = ['orchestrator', 'export', 'files', uuid];
                return new BBReq('export', this.config, a);
            } else {
                a = ['export', 'portal'];
                return new BBReq('export', this.config, a)
                .query({portalName: this.config.portal, includeGroups: true});
            }
	},
	exportItem: function(itemName, fromPortal) {
            var a = ['export', 'package'];
            if (fromPortal) a.push(this.config.portal);
            a.push(itemName);
            return new BBReq('exportItem', this.config, a);
	},
        auto: function(payload, overrideMethod) {
            var payloadType = getPayloadType(payload);
            var t = this;

            if (payloadType === 'filePath') {
                return this.config.plugin.get(payload)
                .then(function(payload) {
                    return t.doAuto(jxon.stringToJs(payload), overrideMethod);
                });
            } else {
                if (payloadType === 'xmlString') payload = jxon.stringToJs(payload);
                t.doAuto(payload, overrideMethod);
            }

        },
        doAuto: function(jx, overrideMethod) {
            var aKey, bKey, plural, context, method, httpMethod;
            var ret = {};
            var items = ['container', 'widget', 'page', 'link', 'template', 'user', 'group'];

            for (aKey in jx) {
                for (bKey in jx[aKey]) break;
                context = jx[aKey][bKey].contextItemName;

                switch (aKey) {
                    case 'catalog':
                        if (context === '[BBHOST]') {
                            method = 'catalog';
                            httpMethod = 'post';
                        } else {
                            method = 'portalCatalog';
                            httpMethod = 'post';
                        }
                        break;
                    case 'portals':
                        method = 'server';
                        httpMethod = 'post';
                        break;
                    case 'portal':
                        method = 'server';
                        httpMethod = 'put';
                        break;
                    default:
                        plural = aKey.charAt(aKey.length - 1) === 's';
                        if (plural) {
                            if (aKey.substr(0, aKey.length - 1) === bKey) {
                                method = bKey;
                                httpMethod = 'post';
                            } else {
                                throw new Error(aKey + ' must be plural of ' + bKey);
                            }
                        } else {
                            if (items.indexOf(aKey) !== -1) {
                                method = aKey;
                                httpMethod = 'put';
                            } else {
                                method = aKey;
                                httpMethod = 'post';
                            }
                        }
                        break;
                }
                break;
            }
            if (overrideMethod) httpMethod = overrideMethod;
            return this[method]()[httpMethod](jx);
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
        file: function(file) {
            if (this.uri[0] === 'import') {
                 this.headers['Content-Type'] = 'multipart/form-data';
                 this.headers['Connection'] = 'keep-alive';
                if (this.uri[1] !== 'package') {
                    this.uri = ['orchestrator', 'import', 'upload'];
                }
            }
            this.targetFile = file;
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
            if (this.uri[4] !== 'rights') {
                if (this.uri[2] === 'pages' && this.uri[3]) this.uri[3] += '.xml';
                if (this.uri[2] === 'containers' && this.uri[3]) this.uri[3] += '.xml';
                if (this.uri[2] === 'widgets' && this.uri[3]) this.uri[3] += '.xml';
                if (this.uri[2] === 'links' && this.uri[3]) this.uri[3] += '.xml';
            }
            this.method = 'GET';
            return this.doRequest();
	},
	post: function(payload) {
            this.method = 'POST';
            if (this.uri[0] === 'export' && this.uri[1] !== 'package') {
                this.uri = ['orchestrator', 'export', 'exportrequests'];
            }
            return this.doRequest(payload);
	},
	put: function(payload) {
            this.method = 'PUT';
            return this.doRequest(payload);
	},
	// fixing inconsistencies in API
	// server /delete/catalog POST
	// portal /portals/[portal_name]/delete/catalog POST
	// link /portals/[portal_name]/delete/links POST
	delete: function(payload) {
            this.method = 'DELETE';
            if (payload) {
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
            return this.doRequest(payload);
	},
        doRequest: function(payload) {
            var payloadType = payload ? getPayloadType(payload) : '';
            var toSend = {
                url: this.getUri(),
                method: this.method,
                query: this.qs,
                headers: this.headers,
                payload: (payloadType === 'jxon') ? jxon.jsToString(payload) : payload,
                username: this.config.username,
                password: this.config.password,
                file: this.targetFile
            };
            var that = this;

            if (payloadType === 'filePath') {
                return this.config.plugin.get(payload)
                .then(function(fileContent) {
                    toSend.payload = fileContent.toString();
                    return that.config.plugin.request(toSend)
                    .then(function(res) {
                        return that.parseResponse(res);
                    });
                });
            } else {
                return this.config.plugin.request(toSend)
                .then(function(res) {
                    return that.parseResponse(res);
                });
            }
        },
        parseResponse: function(res) {
            res.body = unescape(res.body);
            var jx = jxon.stringToJs(res.body);
            if (res.statusCode >= 300) {
                if (jx.html) {
                    var o = {};
                    parseForError(jx.html.body, o);
                    res.error = o.title + ' ' + o.description;
                    throw new Error(res.error);
                } else {
                    console.log(e.body);
                }
            } else {
                // if (this.config.payloadType === 'jxon') res.body = jx;
                if (this.config.outputJxon) res.body = jx;
            }
            return res;
        },
        deleteAllCache: function(i) {
            var t = this;
            this.uri[1] = cch[i];
            return this.doRequest().then(function(v) {
                if (i < cch.length - 1) return t.deleteAllCache(++i);
                return v;
            });
        },
        getUri: function(excludePath) {
            var cfg = this.config;
            if (this.uri[0] === 'orchestrator' && cfg.orchestrator) cfg = this.config.orchestrator;

            var out = cfg.scheme + '://' +
            cfg.host + ':' +
            cfg.port + '/' +
            cfg.context + '/';
            if (excludePath) return out;
            return out + this.uri.join('/');
        }
    });

function getPayloadType(payload) {
    if (typeof payload === 'object') return 'jxon';
    if (typeof payload !== 'string' || payload === '') throw new Error('Wrong payload: ' + payload);
    if (payload.charAt(0) === '<') return 'xmlString';
    return 'filePath';
}

function unescape(html) {
  return String(html)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function parseForError(el, o) {
    if (el.$class === 'bd-errorTitle') o.title = el._;
    if (el.$class === 'bd-errorDescription') o.description = el._;
    for (var key in el) if (typeof el[key] === 'object') parseForError(el[key], o);
}

var cch = ['globalModelCache',
        'retrievedWidgetCache',
        'widgetChromeStaticCache',
        'serverSideClosureCache',
        'urlLevelCache',
        'contentTemplateCache',
        'webCache',
        'gModelCache',
        'uuidFromExtendedItemNamesCache',
        'springAclCacheRegion',
        'springAclSidCacheRegion',
        'contextNameToItemNameToUuidCache',
        'widgetCache',
        'uuidToContentReferencesCache',
        'itemUuidToReferencingLinkUuidsCache',
        'uuidToCacheKeysCache',
        'versionBundleCache'];

/* include */


return BBRest;
}));

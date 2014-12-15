(function(window){


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
        // if item is boolean target is portal catalog, if string, target is item in server catalog
        catalog: function(item) {
            var a = [],
                target = 'server';

            if (typeof item === 'boolean') {
                a = ['portals', this.config.portal];
                target = 'portal';
            } else {
                a = ['server'];
                if (item) a.push(item);
            }
	    return new BBReq(target, this.config, a);
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
	group: function(groupName, showUsers) {
	    var a = ['groups'];
	    if (groupName) a.push(groupName);
	    if (showUsers) a.push('users');
	    return new BBReq('group', this.config, a);
	},
	template: function(templateName) {
	    var a = ['templates'];
	    if (templateName) a.push(templateName);
	    return new BBReq('template', this.config, a);
	},
	audit: function(meta) {
	    return new BBReq('audit', this.config, [meta? 'auditmeta' : 'auditevents']);
	},
	cache: function(type) {
	    var a = ['caches', type];
	    return new BBReq('cache', this.config, a);
	},
	import: function() {
	},
	export: function() {
	}

    });

    function BBReq(cmnd, cnf, uri) {
	this.command = cmnd;
	this.config = extend({}, cnf);
	this.uri = uri;
	this.qs = {};
	this.headers = {
	    "Content-Type": "application/xml"
	};
    }

    extend(BBReq.prototype, {
	rights: function() {
	    this.uri.push('rights');
	    return this;
	},
	tag: function(tagName) {
	    this.uri.push('tags');
	    if (tagName) this.uri.push(tagName);
	    return this;
	},
	query: function(o) {
	    this.qs = o;
	    return this;
	},
	get: function() {
            /* methods that use .xml:
             * portal().xml().get() - only this one is exception, the rest of them work without xml extension
             * container('name').xml().get()
             * widget('name').xml().get()
             * page('name').xml().get()
             * link('name').xml().get() */
	    if (this.uri[0] === 'portals' && this.uri.length === 2) this.uri[1] += '.xml';
	    this.method = 'GET';
	    return this.req();
	},
	post: function(d, p) {
	    this.method = 'POST';
	    return this.parseInput(d, p);
	},
	put: function(d, p) {
	    this.method = 'PUT';
	    return this.parseInput(d, p);
	},
	// fixing inconsistencies in API
	// server /delete/catalog POST
	// portal /portals/[portal_name]/delete/catalog POST
	// link /portals/[portal_name]/delete/links POST
	delete: function(v, p) {
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
	    return this.parseInput(v, p);
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

/* include */
	
	
})(this);

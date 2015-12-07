import * as utils from './utils';
import response from './response';
import log from './logger';

// cache names for deleteAll
const cch = ['globalModelCache',
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

export default function BBReq(cmnd, cnf, uri) {
  this.command = cmnd;
  this.config = Object.assign({}, cnf);
  this.uri = uri;
  this.qs = {};
  this.headers = {
    'Content-Type': 'application/xml'
  };
}
Object.assign(BBReq.prototype, {
    rights() {
        this.uri.push('rights');
        return this;
    },
    tag(tagName, tagType) {
        this.uri.push('tags');
        if (tagName) this.uri.push(tagName);
        if (tagType) this.qs.type = tagType;
        return this;
    },
    query(o) {
        this.qs = o;
        return this;
    },
    file(file) {
        if (this.uri[0] === 'import') {
            this.headers['Content-Type'] = 'multipart/form-data';
            this.headers.Connection = 'keep-alive';
            if (this.uri[1] !== 'package') {
                this.uri = ['orchestrator', 'import', 'upload'];
            }
        }
        this.targetFile = file;
        return this;
    },
    get() {
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
        return this.prepareRequest();
    },
    post(payload) {
        this.method = 'POST';
        if (this.uri[0] === 'export' && this.uri[1] !== 'package') {
            this.uri = ['orchestrator', 'export', 'exportrequests'];
        }
        return this.prepareRequest(payload);
    },
    put(payload) {
        this.method = 'PUT';
        return this.prepareRequest(payload);
    },
    // fixing inconsistencies in API
    // server /delete/catalog POST
    // portal /portals/[portal_name]/delete/catalog POST
    // link /portals/[portal_name]/delete/links POST
    delete(payload) {
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
        return this.prepareRequest(payload);
    },
    prepareRequest(payload) {
        const payloadType = payload ? utils.getPayloadType(payload) : '';
        const toSend = {
            url: getFullUri(this.getUri(), this.qs),
            method: this.method,
            query: this.qs,
            headers: this.headers,
            username: this.config.username,
            password: this.config.password,
            file: this.targetFile,
            csrf: this.config.csrf
        };
        if (this.targetFile) {
            if (this.method === 'POST') {
                toSend.upload = (toSend.url.indexOf('import/package') === -1) ? 'file' : 'package';
            } else if (toSend.url.indexOf('/export/') > -1) {
                toSend.download = true;
            }
        }
        const that = this;

        switch (payloadType) {
        case 'jxon':
            toSend.body = utils.jsToString(payload);
            return this.doRequest(toSend);
        case 'path':
            return this.config.plugin.get(payload)
            .then(function(fileContent) {
                toSend.body = fileContent;
                return that.doRequest(toSend);
            });
        default:
            toSend.body = payload;
            return this.doRequest(toSend);
        }
    },
    doRequest(toSend) {
      log('Request Configuration', toSend);
      const that = this;
      return this.config.plugin.request(toSend)
        .then(function(res) {
          log('Response', res);
          return response(that.config, toSend, res);
        });
    },
    deleteAllCache(i) {
        const t = this;
        this.uri[1] = cch[i];
        return this.prepareRequest().then(function(v) {
            if (i < cch.length - 1) return t.deleteAllCache(i + 1);
            return v;
        });
    },
    getUri() {
        let cfg = this.config;
        if (this.uri[0] === 'orchestrator' && cfg.orchestrator) cfg = this.config.orchestrator;

        return cfg.scheme + '://' +
            cfg.host + ':' +
            cfg.port + '/' +
            cfg.context + '/' +
            this.uri.join('/')
    }
});

function getFullUri(url, query) {
    if (Object.keys(query).length) {
        const params = [];
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
            }
        }
        url += '?' + params.join('&');
    }
    return url;
}

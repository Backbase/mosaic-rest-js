import BBReq from './request';
import * as utils from './utils';
import log, { setEnable } from './logger'

const defaults = {
    scheme: 'http',
    host: 'localhost',
    port: '7777',
    context: 'portalserver',
    username: 'admin',
    password: 'admin',
    portal: null,
    outputJxon: true,
    verbose: false,
};

function BBRest(config) {
    this.config = config;
    setEnable(config.verbose);
    log('Configuration', config);
}

export default function create(cnf) {
    if (!cnf.hasOwnProperty('plugin')) throw new Error('Configuration object must define plugin property');
    const config = Object.assign({}, defaults, cnf);
    return new BBRest(config);
}

Object.assign(BBRest.prototype, {
    server() {
        return new BBReq('server', this.config, ['portals']);
    },
    portal() {
        const a = ['portals', this.config.portal];
        return new BBReq('portal', this.config, a);
    },
    catalog(item) {
        const a = ['catalog'];
        if (item) a.push(item);
        return new BBReq('server', this.config, a);
    },
    portalCatalog(item) {
        const a = ['portals', this.config.portal, 'catalog'];
        if (item) a.push(item);
        return new BBReq('portal', this.config, a);
    },
    container(containerName) {
        const a = ['portals', this.config.portal, 'containers'];
        if (containerName) a.push(containerName);
        return new BBReq('container', this.config, a);
    },
    widget(widgetName) {
        const a = ['portals', this.config.portal, 'widgets'];
        if (widgetName) a.push(widgetName);
        return new BBReq('widget', this.config, a);
    },
    page(pageName) {
        const a = ['portals', this.config.portal, 'pages'];
        if (pageName) a.push(pageName);
        return new BBReq('page', this.config, a);
    },
    link(linkName) {
        const a = ['portals', this.config.portal, 'links'];
        if (linkName) a.push(linkName);
        return new BBReq('link', this.config, a);
    },
    user(userName, showGroups, groupName) {
        const a = ['users'];
        if (userName) a.push(userName);
        if (showGroups) a.push('groups');
        if (groupName) a.push(groupName);
        return new BBReq('user', this.config, a);
    },
    group(groupName, showUsers, userName) {
        const a = ['groups'];
        if (groupName) a.push(groupName);
        if (showUsers) a.push('users');
        if (userName) a.push(userName);
        return new BBReq('group', this.config, a);
    },
    template(templateName) {
        const a = ['templates'];
        if (templateName) a.push(templateName);
        return new BBReq('template', this.config, a);
    },
    audit(meta) {
        return new BBReq('audit', this.config, [meta ? 'auditmeta' : 'auditevents']);
    },
    cache(type) {
        const a = ['caches', type];
        return new BBReq('cache', this.config, a);
    },
    import() {
        const a = ['import', 'portal'];
        return new BBReq('import', this.config, a);
    },
    importItem(toPortal) {
        const a = ['import', 'package'];
        if (toPortal) a.push(this.config.portal);
        return new BBReq('importItem', this.config, a);
    },
    export(uuid) {
        let a;
        if (uuid) {
            a = ['orchestrator', 'export', 'files', uuid];
            return new BBReq('export', this.config, a);
        }
        a = ['export', 'portal'];
        return new BBReq('export', this.config, a)
            .query({portalName: this.config.portal, includeGroups: true});
    },
    exportItem(itemName, fromPortal) {
        const a = ['export', 'package'];
        if (fromPortal) a.push(this.config.portal);
        a.push(itemName);
        return new BBReq('exportItem', this.config, a);
    },
    auto(payload, overrideMethod) {
        const payloadType = utils.getPayloadType(payload);
        let payloadParse;
        const t = this;

        if (payloadType === 'path') {
            return this.config.plugin.get(payload)
                .then(function(payloadRes) {
                    return t.doAuto(utils.stringToJs(payloadRes), overrideMethod);
                });
        }
        if (payloadType === 'xml') payloadParse = utils.stringToJs(payload);
        return t.doAuto(payloadParse || payload, overrideMethod);
    },
    doAuto(jx, overrideMethod) {
        const aKey = Object.keys(jx)[0];
        const bKey = Object.keys(jx[aKey])[0];
        const context = jx[aKey][bKey].contextItemName;
        const items = ['container', 'widget', 'page', 'link', 'template', 'user', 'group'];
        let method;
        let httpMethod;

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
            const plural = aKey.charAt(aKey.length - 1) === 's';
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

        if (overrideMethod) httpMethod = overrideMethod;
        return this[method]()[httpMethod](jx);
    }

});

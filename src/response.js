import * as utils from './utils';
import url from 'url';
import log from './logger';

function unescape(html) {
    return String(html)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

const types = {
    '<form action="/portalserver/j_spring_security_check" method="POST"': 'loginForm',
    'class="bd-errorMsg"': 'error'
};
function getHtmlResponseType(body) {
    for (const key in types) {
        if (body.indexOf(key) > -1) return types[key];
    }
    return '';
}

class CXPError extends Error {
    constructor(message, raw, toSend, config) {
        super(message + ' ' + toSend.url);
        this.response = raw;
        this.request = toSend;
        this.config = config;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

/*
 * when response is 2xx but error is printed in html body
 */
function getHtmlError(config, toSend, res) {
    return res.text().then(function(body) {
        const type = getHtmlResponseType(body);
        switch (type) {
        case 'loginForm':
            throw new CXPError('HTML Error: Invalid Session', res, toSend, config);
        case 'error':
            const jx = utils.stringToJs(body);
            const p = jx.html.body.div.div.p;
            throw new CXPError('HTML Error: ' + p[1]._, res, toSend, config);
        default:
            throw new CXPError('HTML Error: Unknown CXP Error', res, toSend, config);
        }
    });
}

/*
 * config - bbrest main config object(scheme, host etc)
 * toSend - object passed to plugin.request(url, method, query, headers...)
 * res - response object(status, statusText, headers, text)
 */
export default function parseResponse(config, toSend, res) {
    if (res.status >= 200 && res.status < 300) {
        const typeHeader = res.headers.get('content-type');
        const type = typeHeader ? typeHeader.split(';')[0] : '';

        if (type === 'text/html') return getHtmlError.apply(this, arguments);
        // download
        if (type === 'application/octet-stream') return toSend.file;

        const bodyPromise = res.text();
        if (config.outputJxon) {
            return bodyPromise.then(function(body) {
                return utils.stringToJs(body);
            });
        }
        return bodyPromise;
    } else if (res.status >= 300 && res.status < 400) {
        const href = url.parse(res.headers.get('location'), true);
        throw new CXPError('CXPRedirect: ' + href.query.errorMessage, res, toSend, config);
    }
    res.text().then(function(out) {
      log('CXPError', out);
    });
    throw new CXPError('CXPError', res, toSend, config);
}

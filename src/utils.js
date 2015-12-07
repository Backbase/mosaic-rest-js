import jxon from 'jxon';

let lastError;
jxon.config({
    parserErrorHandler: function onError(level, msg) {
        lastError.level = level;
        lastError.msg = msg;
    }
});

export function jsToString(js) {
    try {
        const ret = jxon.jsToString(js);
        if (ret[0] !== '<') throw new Error('Invalid parameter:');
        return ret;
    } catch (err) {
        const e = new Error('jxon.jsToString error\n' + err.message + '\n' + JSON.stringify(js));
        e.error = err;
        throw e;
    }
}
export function stringToJs(str) {
    try {
        if (typeof str !== 'string') throw new TypeError('Invalid parameter:');
        if (!str.length) return {};
        lastError = {};
        const ret = jxon.stringToJs(str);
        if (lastError.level && lastError.level !== 'warning') throw new Error(lastError.msg);
        return ret;
    } catch (err) {
        const e = new Error('jxon.stringToJs error\n' + err.message + '\n' + JSON.stringify(str));
        e.error = err;
        throw e;
    }
}

export function getPayloadType(payload) {
    if (typeof payload === 'object') return 'jxon';
    if (typeof payload !== 'string' || payload === '') throw new Error('Wrong payload: ' + payload);
    if (payload.trim().charAt(0) === '<') return 'xml';
    return 'path';
}

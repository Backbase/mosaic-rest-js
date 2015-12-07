/* global describe, before, beforeEach, it, require */
'use strict';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import response from '../src/response';
import fs from 'fs';
import path from 'path';
const assert = chai.assert;
chai.use(chaiAsPromised);
let promise;

const errors = {};
const errorPath = path.resolve('./test/errorResponses/');
const errorFiles = fs.readdirSync(errorPath) || [];
errorFiles.forEach(function(file) {
    errors[path.parse(file).name] = fs.readFileSync(path.join(errorPath, file)).toString();
});

function stubHeader(key, val) {
    const o = {};
    o[key] = val;
    o.get = (ky) => o[ky];
    return o;
}

function stubResponse(headers, content = '') {
    return {
        status: 200,
        url: 'stub',
        headers: headers,
        text: () => Promise.resolve(content),
    };
}

describe('Testing HTML errors', function() {
    it('should be unknown html error', function() {
        const headers = stubHeader('content-type', 'text/html;asdadasd');
        promise = response({}, {}, stubResponse(headers));
        return assert.isRejected(promise, /Unknown CXP Error/);
    });
    it('html login form should throw error', function() {
        const headers = stubHeader('content-type', 'text/html;asdadasd');
        promise = response({}, {}, stubResponse(headers, errors.loginForm));
        return assert.isRejected(promise, /Access Denied/);
    });
    it('html item exists should throw error', function() {
        const headers = stubHeader('content-type', 'text/html;asdadasd');
        promise = response({}, {}, stubResponse(headers, errors.itemExists));
        return assert.isRejected(promise, /An Item with the given name/);
    });
});

/* global describe, before, beforeEach, it, require */
'use strict';
import {assert} from 'chai';
import * as utils from '../src/utils';

describe('Testing jxon errors...', function() {
    it('jsToString, passing invalid jxon object', function() {
        assert.throws(function() {
            utils.jsToString(['!@##$@RE#']);
        }, /jsToString error/);
        assert.throws(function() {
            utils.jsToString({});
        }, /jsToString error/);
        assert.throws(function() {
            utils.jsToString([]);
        }, /jsToString error/);
    });
    it('stringToJs, passing invalid xml string', function() {
        assert.throws(function() {
            utils.stringToJs(['!@##$@RE#']);
        }, /stringToJs error/);
        assert.throws(function() {
            utils.stringToJs({});
        }, /stringToJs error/);
        assert.throws(function() {
            utils.stringToJs([]);
        }, /stringToJs error/);
        assert.throws(function() {
            utils.stringToJs('<pop><zs></pop></zs>');
        }, /end tag name/);
        assert.throws(function() {
            utils.stringToJs('<pop>asd<</pop>');
        }, /invalid tagName/);
    });
});

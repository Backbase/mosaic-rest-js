/* global describe, before, beforeEach, it, require */
'use strict';
import BBRest from '../src/main.js';
import * as fetchPlugin from '../src/needle-plugin.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import nodeUtil from 'util';
chai.use(chaiAsPromised);
const assert = chai.assert;
const xmlPath = './test/xml/';
let promise;
let bbrest;
let r;

function debug(prom) {
    prom
        .then(function(res) {
            console.log('THEN', res);
        })
        .catch(function(err) {
            console.log('CATCH', err);
            console.log('Response Headers', err.response.headers);
            console.log(err.response._raw.toString());
        });
}

describe('Running BBRest tests...', function() {
    before('Creating BBRest instance', function() {
        r = bbrest = BBRest({
            portal: 'myBraveNewPortal',
            plugin: fetchPlugin,
            verbose: true,
        });
    });

    describe('Testing server and portal methods', function() {
        it('should return portal list', function() {
            promise = bbrest.server().get();
            return assert.isFulfilled(promise);
        });

        it('should add testing portal', function() {
            promise = bbrest.server().post(xmlPath + 'addPortal.xml');
            return assert.isFulfilled(promise);
        });

        it('should update testing portal', function() {
            promise = bbrest.server().put(xmlPath + 'updatePortal.xml');
            return assert.isFulfilled(promise);
        });

        it('should return portal xml', function() {
            promise = bbrest.portal().get();
            return assert.isFulfilled(promise);
        });

        it('should return portal rights', function() {
            promise = bbrest.portal().rights().get();
            return assert.isFulfilled(promise);
        });

        it('should return portal tags', function() {
            r.portal().tag().get();
            return assert.isFulfilled(promise);
        });
    });

    describe('Testing catalog methods', function() {
        it('should return server catalog with proper page size', function() {
            promise = bbrest.catalog().query({ps: 4}).get();
            return assert.isFulfilled(promise);
        });
        it('should return portal catalog', function() {
            promise = bbrest.catalog().get();
            return assert.isFulfilled(promise);
        });
    });

    let exPath = xmlPath + 'portal-export-test.zip';
    describe('Testing portal export methods', function() {
        this.timeout(3000);
        let id;

        it('Should export a portal as xml', function() {
            promise = bbrest.export().get();
            return assert.isFulfilled(promise);
        });
        it('Should prepare file export of a portal', function() {
            promise = bbrest.export().post(xmlPath + 'export.xml')
            .then(function(d) {
                id = d.exportResponse.identifier;
                return d;
            });
            return assert.isFulfilled(promise);
        });
        it('Should download a portal export file', function() {
            try {
                fs.unlinkSync(exPath);
            } catch(err) {}
            promise = bbrest.export(id).file(exPath).get()
            .then(function(file) {
                return fs.statSync(file).isFile();
            });
            return assert.becomes(promise, true);
        });
    });

    describe('Testing portal import methods', function() {
        this.timeout(6000);

        it('Should post a portal', function() {
            promise = bbrest.import().post(xmlPath + 'addPortalImport.xml');
            return assert.isFulfilled(promise);
        });
        it('Should upload a portal', function() {
            promise = bbrest.import().file(exPath).post();
            debug(promise);
            return assert.isFulfilled(promise);
        });
        it('Should remove export file', function(done) {
            fs.unlink(exPath, function() {
                done();
            });
        });
    });

    describe.skip('Testing package export methods', function() {
        this.timeout(3000);

        exPath = '/Users/igor/export-test/package-export-test.zip';
        it('Should download a portal item, CXP5.6 only.', function() {
            try {
                fs.unlinkSync(exPath);
            } catch(err) {}
            promise = bbrest.exportItem('widget-navbar-advanced').file(exPath).get()
            .then(function(file) {
                return fs.statSync(file).isFile();
            });
            return assert.becomes(promise, true);
        });
        // const imPath = '/Users/igor/export-test/widget-navbar-advanced-bad.zip';
        it('Should upload a portal item, CXP5.6 only', function() {
            promise = bbrest.importItem().file(exPath).post()
            .then(function(file) {
                return fs.statSync(file).isFile();
            });
            return assert.becomes(promise, true);
        });
    });


    describe.skip('Testing widget methods', function() {
        it('should return all widgets', function(done) {
            r.widget().get().then(function(d) {
                assert.propertyVal(d, 'statusCode', 200);
                //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
                //console.log(myw.properties[0].property);
                done();
            });
        });
        it('should delete mywidget', function(done) {
            r.catalog('mywidget').delete().then(function(d) {
                assert.propertyVal(d, 'statusCode', 204);
                //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
                //console.log(myw.properties[0].property);
                done();
            });
        });

        it('should create a widget', function(done) {
            r.portalCatalog().post(xmlPath + 'addWidget.xml').then(function(d) {
                assert.isBelow(d.statusCode, 300);
                //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
                //console.log(myw.properties[0].property);
                done();
            });
        });
        it('should return my widget', function(done) {
            r.widget('mywidget').get().then(function(d) {
                assert.propertyVal(d, 'statusCode', 200);
                //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
                //console.log(myw.properties[0].property);
                done();
            });
        });
    });

    describe.skip('Testing auto method', function() {
        it('should do server POST', function() {
            const j = {portals: {
                portal: {
                    contextItemName: '[BBHOST]'
                }
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['server', 'post']);
        });
        it('should do server PUT', function() {
            const j = {
                portal: {
                    contextItemName: '[BBHOST]'
                }
            };
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['server', 'put']);
        });
        it('should do server catalog POST', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: '[BBHOST]'
                }
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['catalog', 'post']);
        });
        it('should do server catalog PUT', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: '[BBHOST]'
                }
            }};
            const a = r.jxonToObj(j, 'put');
            assert.deepEqual(a, ['catalog', 'put']);
        });
        it('should do portal catalog POST', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: 'myPortal'
                }
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['portalCatalog', 'post']);
        });
        it('should do container POST', function() {
            const j = {containers: {
                container: {
                    contextItemName: 'myPortal'
                }
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['container', 'post']);
        });
        it('should do widget PUT', function() {
            const j = {widget: {
                contextItemName: 'myPortal'
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['widget', 'put']);
        });
        it('should do user POST', function() {
            const j = {users: {
                user: {
                    username: 'myName'
                }
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['user', 'post']);
        });
        it('should do user PUT', function() {
            const j = {user: {
                username: 'myName'
            }};
            const a = r.jxonToObj(j);
            assert.deepEqual(a, ['user', 'put']);
        });

        it('should auto create a widget', function(done) {
            r.auto(xmlPath + 'addWidget.xml').then(function(d) {
                assert.isBelow(d.statusCode, 300);
                done();
            });
        });
    });

    describe.skip('Testing all cache delete', function() {
        it('should delete all caches', function(done) {
            r.cache('all').delete().then(function(v) {
                assert.propertyVal(v, 'statusCode', 204);
                //assert.deepPropertyVal(v, 'body.portals.portal.length', 3);
                done();
            });
        });
    });


    describe('Clean up...', function() {
        it('should remove testing portal', function() {
            promise = bbrest.portal().delete();
            return assert.isFulfilled(promise);
        });

        it.skip('should remove imported portal', function(done) {
            r.config.portal = 'test-portal';
            r.portal().delete().then(function(d) {
                assert.propertyVal(d, 'statusCode', 204);
                done();
            });
        });
    });
});

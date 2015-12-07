/* global describe, before, beforeEach, it, require */
'use strict';
import * as BBRest from '../src/main.js';
import {assert} from 'chai';
let bbrest;
let request;
let uri;

describe('Running BBRest tests...', function() {
    before('Creating BBRest instance', function() {
        bbrest = BBRest.create({
            portal: 'test-portal',
            plugin: {
                get: function() {
                    return Promise.resolve('<>');
                },
                request: function(obj) {
                    request = obj;
                    return Promise.resolve(request);
                }
            }
        });
        uri = bbrest.config.scheme + '://' +
              bbrest.config.host + ':' +
              bbrest.config.port + '/' +
              bbrest.config.context + '/';
    });

    describe('Testing BBRest instance...', function() {
        it('should fail if plugin is not defined', function() {
            assert.throws(function() {
                BBRest.create();
            }, Error);
        });

        it('should target test-portal', function() {
            assert.equal(bbrest.config.portal, 'test-portal');
        });
    });

    describe('Testing server endpoints...', function() {
        let serverReq;

        beforeEach('Creating BBReq server instance', function() {
            serverReq = bbrest.server();
        });

        describe('Testing Request object...', function() {
            it('should return BBReq instance, server command', function() {
                assert.equal(serverReq.command, 'server');
            });

            it('should contain config', function() {
                assert.deepEqual(bbrest.config, serverReq.config);
            });

            it('should have proper Content-type header application/xml', function() {
                assert.equal(serverReq.headers['Content-Type'], 'application/xml');
            });

            it('should set query', function() {
                const o = {
                    num: 123,
                    float: 1.23,
                    str: 'hello world',
                    bool: false
                };
                serverReq.query(o);
                assert.deepEqual(serverReq.qs, o);
            });

            it('should set get', function() {
                serverReq.get();
                assert.equal(request.method, 'GET');
            });

            it('should set post', function() {
                serverReq.post();
                assert.equal(request.method, 'POST');
            });

            it('should set put', function() {
                serverReq.put();
                assert.equal(request.method, 'PUT');
            });

            it('should set delete', function() {
                serverReq.delete();
                assert.equal(request.method, 'DELETE');
            });

            it('should not treat js object as file path', function() {
                serverReq.post({foo: 'boo'});
                assert.equal(request.body, '<foo>boo</foo>');
            });

            it('should not treat xml as file path', function() {
                const pl = '<xml attr="boo"></xml>';
                serverReq.post(pl);
                assert.equal(request.body, pl);
            });

            it('should throw error if payload is wrong type', function() {
                assert.throws(function() {
                    serverReq.post(4);
                }, Error);
            });

            it('should treat non empty string as file path', function(done) {
                serverReq.post('./my.xml')
                .catch(function(err) {
                    assert.equal(err.response.body, '<>');
                    done();
                });
            });

            it('should convert jxon payload to xml', function() {
                serverReq.post({foo: 'boo'});
                assert.equal(request.body, '<foo>boo</foo>');
            });
        });

        it('server.get url', function() {
            serverReq.get();
            assert.equal(request.url, uri + 'portals');
        });

        it('server.post url', function() {
            serverReq.post();
            assert.equal(request.url, uri + 'portals');
        });

        it('server.put url', function() {
            serverReq.put();
            assert.equal(request.url, uri + 'portals');
        });
    });

    describe('Testing portal endpoints...', function() {
        let portalReq;

        beforeEach('Creating BBReq portal instance', function() {
            portalReq = bbrest.portal();
        });

        it('portal.get url', function() {
            portalReq.get();
            assert.equal(request.url, uri + 'portals/test-portal.xml');

        });

        it('portal.rights.get url', function() {
            portalReq.rights().get();
            assert.equal(request.url, uri + 'portals/test-portal/rights');
        });

        it('portal.rights.put url', function() {
            portalReq.rights().put();
            assert.equal(request.url, uri + 'portals/test-portal/rights');
        });

        it('portal.tag.get url', function() {
            portalReq.tag().get();
            assert.equal(request.url, uri + 'portals/test-portal/tags');
        });

        it('portal.tag.post url', function() {
            portalReq.tag().post();
            assert.equal(request.url, uri + 'portals/test-portal/tags');
        });

        it('portal.tag(name).delete url', function() {
            portalReq.tag('my-tag').delete();
            assert.equal(request.url, uri + 'portals/test-portal/tags/my-tag');
        });

        it('portal.put url', function() {
            portalReq.put();
            assert.equal(request.url, uri + 'portals/test-portal');
        });

        it('portal.delete url', function() {
            portalReq.delete();
            assert.equal(request.url, uri + 'portals/test-portal');
        });
    });

    describe('Testing catalog endpoints...', function() {
        let catalogReq;

        beforeEach('Creating BBReq catalog instance', function() {
            catalogReq = bbrest.catalog();
        });

        it('catalog.get url', function() {
            catalogReq.get();
            assert.equal(request.url, uri + 'catalog');
        });

        it('catalog.post url', function() {
            catalogReq.post();
            assert.equal(request.url, uri + 'catalog');
        });

        it('catalog.put url', function() {
            catalogReq.put();
            assert.equal(request.url, uri + 'catalog');
        });

        it('catalog.delete(batch) url', function() {
            catalogReq.delete('<>');
            assert.equal(request.url, uri + 'delete/catalog');
        });

        it('catalog(item).get url', function() {
            bbrest.catalog('my-item').get();
            assert.equal(request.url, uri + 'catalog/my-item');
        });

        it('catalog(item).delete url', function() {
            bbrest.catalog('my-item').delete();
            assert.equal(request.url, uri + 'catalog/my-item');
        });
    });

    describe('Testing portal catalog endpoints...', function() {
        let catalogReq;

        beforeEach('Creating BBReq catalog instance', function() {
            catalogReq = bbrest.portalCatalog();
        });

        it('catalog.get url', function() {
            catalogReq.get();
            assert.equal(request.url, uri + 'portals/test-portal/catalog');
        });

        it('catalog.post url', function() {
            catalogReq.post();
            assert.equal(request.url, uri + 'portals/test-portal/catalog');
        });

        it('catalog.put url', function() {
            catalogReq.put();
            assert.equal(request.url, uri + 'portals/test-portal/catalog');
        });

        it('catalog.delete(batch) url', function() {
            catalogReq.delete('<>');
            assert.equal(request.url, uri + 'portals/test-portal/delete/catalog');
        });

        it('catalog(item).get url', function() {
            bbrest.portalCatalog('my-item').get();
            assert.equal(request.url, uri + 'portals/test-portal/catalog/my-item.xml');
        });

        it('catalog(item).delete url', function() {
            bbrest.portalCatalog('my-item').delete();
            assert.equal(request.url, uri + 'portals/test-portal/catalog/my-item');
        });
    });

    describe('Testing page endpoints...', function() {
        it('page.get url', function() {
            bbrest.page().get();
            assert.equal(request.url, uri + 'portals/test-portal/pages');
        });

        it('page.post url', function() {
            bbrest.page().post('<>');
            assert.equal(request.url, uri + 'portals/test-portal/pages');
        });

        it('page.put url', function() {
            bbrest.page().put();
            assert.equal(request.url, uri + 'portals/test-portal/pages');
        });

        it('page(name).get url', function() {
            bbrest.page('my-page').get();
            assert.equal(request.url, uri + 'portals/test-portal/pages/my-page.xml');
        });

        it('page(name).put url', function() {
            bbrest.page('my-page').put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/pages/my-page');
        });

        it('page(name).delete url', function() {
            bbrest.page('my-page').delete();
            assert.equal(request.url, uri + 'portals/test-portal/pages/my-page');
        });

        it('page(name).rights.get url', function() {
            bbrest.page('my-page').rights().get();
            assert.equal(request.url, uri + 'portals/test-portal/pages/my-page/rights');
        });

        it('page(name).rights.put url', function() {
            bbrest.page('my-page').rights().put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/pages/my-page/rights');
        });
    });

    describe('Testing container endpoints...', function() {
        it('container.get url', function() {
            bbrest.container().get();
            assert.equal(request.url, uri + 'portals/test-portal/containers');
        });

        it('container.post url', function() {
            bbrest.container().post('<>');
            assert.equal(request.url, uri + 'portals/test-portal/containers');
        });

        it('container.put url', function() {
            bbrest.container().put();
            assert.equal(request.url, uri + 'portals/test-portal/containers');
        });

        it('container(name).get url', function() {
            bbrest.container('my-container').get();
            assert.equal(request.url, uri + 'portals/test-portal/containers/my-container.xml');
        });

        it('container(name).put url', function() {
            bbrest.container('my-container').put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/containers/my-container');
        });

        it('container(name).delete url', function() {
            bbrest.container('my-container').delete();
            assert.equal(request.url, uri + 'portals/test-portal/containers/my-container');
        });

        it('container(name).rights.get url', function() {
            bbrest.container('my-container').rights().get();
            assert.equal(request.url, uri + 'portals/test-portal/containers/my-container/rights');
        });

        it('container(name).rights.put url', function() {
            bbrest.container('my-container').rights().put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/containers/my-container/rights');
        });
    });

    describe('Testing widget endpoints...', function() {
        it('widget.get url', function() {
            bbrest.widget().get();
            assert.equal(request.url, uri + 'portals/test-portal/widgets');
        });

        it('widget.post url', function() {
            bbrest.widget().post('<>');
            assert.equal(request.url, uri + 'portals/test-portal/widgets');
        });

        it('widget.put url', function() {
            bbrest.widget().put();
            assert.equal(request.url, uri + 'portals/test-portal/widgets');
        });

        it('widget(name).get url', function() {
            bbrest.widget('my-widget').get();
            assert.equal(request.url, uri + 'portals/test-portal/widgets/my-widget.xml');
        });

        it('widget(name).put url', function() {
            bbrest.widget('my-widget').put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/widgets/my-widget');
        });

        it('widget(name).delete url', function() {
            bbrest.widget('my-widget').delete();
            assert.equal(request.url, uri + 'portals/test-portal/widgets/my-widget');
        });

        it('widget(name).rights.get url', function() {
            bbrest.widget('my-widget').rights().get();
            assert.equal(request.url, uri + 'portals/test-portal/widgets/my-widget/rights');
        });

        it('widget(name).rights.put url', function() {
            bbrest.widget('my-widget').rights().put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/widgets/my-widget/rights');
        });
    });

    describe('Testing link endpoints...', function() {
        it('link.get url', function() {
            bbrest.link().get();
            assert.equal(request.url, uri + 'portals/test-portal/links');
        });

        it('link.post url', function() {
            bbrest.link().post('<>');
            assert.equal(request.url, uri + 'portals/test-portal/links');
        });

        it('link.put url', function() {
            bbrest.link().put();
            assert.equal(request.url, uri + 'portals/test-portal/links');
        });

        it('link(name).get url', function() {
            bbrest.link('my-link').get();
            assert.equal(request.url, uri + 'portals/test-portal/links/my-link.xml');
        });

        it('link(name).put url', function() {
            bbrest.link('my-link').put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/links/my-link');
        });

        it('link(name).delete url', function() {
            bbrest.link('my-link').delete();
            assert.equal(request.url, uri + 'portals/test-portal/links/my-link');
        });

        it('link(name).rights.get url', function() {
            bbrest.link('my-link').rights().get();
            assert.equal(request.url, uri + 'portals/test-portal/links/my-link/rights');
        });

        it('link(name).rights.put url', function() {
            bbrest.link('my-link').rights().put('<>');
            assert.equal(request.url, uri + 'portals/test-portal/links/my-link/rights');
        });
    });

    describe('Testing template endpoints...', function() {
        it('template.get url', function() {
            bbrest.template().get();
            assert.equal(request.url, uri + 'templates');
        });

        it('template.post url', function() {
            bbrest.template().post('<>');
            assert.equal(request.url, uri + 'templates');
        });

        it('template(name).get url', function() {
            bbrest.template('my-template').get();
            assert.equal(request.url, uri + 'templates/my-template');
        });

        it('template(name).put url', function() {
            bbrest.template('my-template').put('<>');
            assert.equal(request.url, uri + 'templates/my-template');
        });

        it('template(name).delete url', function() {
            bbrest.template('my-template').delete();
            assert.equal(request.url, uri + 'templates/my-template');
        });

        it('template(name).rights.get url', function() {
            bbrest.template('my-template').rights().get();
            assert.equal(request.url, uri + 'templates/my-template/rights');
        });

        it('template(name).rights.put url', function() {
            bbrest.template('my-template').rights().put('<>');
            assert.equal(request.url, uri + 'templates/my-template/rights');
        });
    });

    describe('Testing user endpoints...', function() {
        it('user.get url', function() {
            bbrest.user().get();
            assert.equal(request.url, uri + 'users');
        });

        it('user.post url', function() {
            bbrest.user().post('<>');
            assert.equal(request.url, uri + 'users');
        });

        it('user(user).get url', function() {
            bbrest.user('my-user').get();
            assert.equal(request.url, uri + 'users/my-user');
        });

        it('user(user).put url', function() {
            bbrest.user('my-user').put('<>');
            assert.equal(request.url, uri + 'users/my-user');
        });

        it('user(user).delete url', function() {
            bbrest.user('my-user').delete();
            assert.equal(request.url, uri + 'users/my-user');
        });

        it('user.get group url', function() {
            bbrest.user('my-user', true).get();
            assert.equal(request.url, uri + 'users/my-user/groups');
        });

        it('user.post group url', function() {
            bbrest.user('my-user', true).post('<>');
            assert.equal(request.url, uri + 'users/my-user/groups');
        });

        it('user.delete from group url', function() {
            bbrest.user('my-user', true, 'my-group').delete();
            assert.equal(request.url, uri + 'users/my-user/groups/my-group');
        });
    });

    describe('Testing group endpoints...', function() {
        it('group.get url', function() {
            bbrest.group().get();
            assert.equal(request.url, uri + 'groups');
        });

        it('group.post url', function() {
            bbrest.group().post('<>');
            assert.equal(request.url, uri + 'groups');
        });

        it('group(group).get url', function() {
            bbrest.group('my-group').get();
            assert.equal(request.url, uri + 'groups/my-group');
        });

        it('group(group).put url', function() {
            bbrest.group('my-group').put('<>');
            assert.equal(request.url, uri + 'groups/my-group');
        });

        it('group(group).delete url', function() {
            bbrest.group('my-group').delete();
            assert.equal(request.url, uri + 'groups/my-group');
        });

        it('group.get users url', function() {
            bbrest.group('my-group', true).get();
            assert.equal(request.url, uri + 'groups/my-group/users');
        });

        it('group.post users url', function() {
            bbrest.group('my-group', true).post('<>');
            assert.equal(request.url, uri + 'groups/my-group/users');
        });

        it('group.delete user url', function() {
            bbrest.group('my-group', true, 'my-user').delete();
            assert.equal(request.url, uri + 'groups/my-group/users/my-user');
        });
    });

    describe('Testing audit endpoints...', function() {
        it('auditevents url', function() {
            bbrest.audit().get();
            assert.equal(request.url, uri + 'auditevents');
        });

        it('auditmeta url', function() {
            bbrest.audit(true).get();
            assert.equal(request.url, uri + 'auditmeta');
        });
    });

    describe('Testing cache endpoints...', function() {
        it('delete any cache url', function() {
            bbrest.cache('my-cache').delete();
            assert.equal(request.url, uri + 'caches/my-cache');
        });

        // it('delete all cache url', function() {
        //     bbrest.cache('all').delete();
        //     assert.equal(request.url, uri + 'caches/my-cache');
        // });
    });

    describe('Testing auto method', function() {
        it('should do server POST', function() {
            const j = {portals: {
                portal: {
                    contextItemName: '[BBHOST]'
                }
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'POST');
            assert.equal(request.url, uri + 'portals');
        });
        it('should do server PUT', function() {
            const j = {portal: {
                contextItemName: '[BBHOST]'
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'PUT');
            assert.equal(request.url, uri + 'portals');
        });
        it('should do server catalog POST', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: '[BBHOST]'
                }
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'POST');
            assert.equal(request.url, uri + 'catalog');
        });
        it('should do server catalog PUT', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: '[BBHOST]'
                }
            }};
            bbrest.auto(j, 'put');
            assert.equal(request.method, 'PUT');
            assert.equal(request.url, uri + 'catalog');
        });
        it('should do portal catalog POST', function() {
            const j = {catalog: {
                widget: {
                    contextItemName: 'test-portal'
                }
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'POST');
            assert.equal(request.url, uri + 'portals/test-portal/catalog');
        });
        it('should do container POST', function() {
            const j = {containers: {
                container: {
                    contextItemName: 'test-portal'
                }
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'POST');
            assert.equal(request.url, uri + 'portals/test-portal/containers');
        });
        it('should do widget PUT', function() {
            const j = {widget: {
                contextItemName: 'test-portal'
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'PUT');
            assert.equal(request.url, uri + 'portals/test-portal/widgets');
        });
        it('should do user POST', function() {
            const j = {users: {
                user: {
                    username: 'myName'
                }
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'POST');
            assert.equal(request.url, uri + 'users');
        });
        it('should do user PUT', function() {
            const j = {user: {
                username: 'myName'
            }};
            bbrest.auto(j);
            assert.equal(request.method, 'PUT');
            assert.equal(request.url, uri + 'users');
        });
    });

    describe('Testing import...', function() {
        it('import.post url', function() {
            bbrest.import().post('<>');
            assert.equal(request.url, uri + 'import/portal');
        });

        it('orchestartor import.file(file).post url', function() {
            bbrest.import().file('my-file').post();
            assert.equal(request.file, 'my-file');
            assert.equal(request.url, uri + 'orchestrator/import/upload');
        });
    });

    describe('Testing export...', function() {
        it('export.get url', function() {
            bbrest.export().get();
            assert.ok(request.url.indexOf(uri + 'export/portal') === 0);
            assert.equal(request.query.portalName, 'test-portal');
        });

        it('orchestrator export.post url', function() {
            bbrest.export().post('<>');
            assert.ok(request.url.indexOf(uri + 'orchestrator/export/exportrequests') === 0);
        });

        it('orchestrator export(id).file(file).get url', function() {
            bbrest.export('my-id').file('my-file').get();
            assert.equal(request.file, 'my-file');
            assert.equal(request.url, uri + 'orchestrator/export/files/my-id');
        });
    });

    describe('Testing import item...', function() {
        it('importItem.post url', function() {
            bbrest.importItem().post();
            assert.equal(request.url, uri + 'import/package');
        });

        it('portal importItem.post url', function() {
            bbrest.importItem(true).post();
            assert.equal(request.url, uri + 'import/package/test-portal');
        });
    });

    describe('Testing export item...', function() {
        it('exportItem(name).get url', function() {
            bbrest.exportItem('my-item').get();
            assert.equal(request.url, uri + 'export/package/my-item');
        });

        it('portal exportItem(name).get url', function() {
            bbrest.exportItem('my-item', true).get();
            assert.equal(request.url, uri + 'export/package/test-portal/my-item');
        });
    });

});

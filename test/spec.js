var r;
if (typeof BBRest !== "undefined") {
    r = new BBRest({portal: 'myBraveNewPortal'});
} else {
    require(['bbrest'], function(BBRest) {
        r = new BBRest({portal: 'myBraveNewPortal'});
    });
}



describe('Testing server and portal methods', function () {

    before(function () {
    });

    it('should return portal list', function (done) {
	r.server().get().then(function(v) {
            assert.propertyVal(v, 'statusCode', 200);
            if (typeof window !== 'undefined') r.config.username = null; // don't do authorization in  browser
            done();
	});
    });

    it('should add testing portal', function (done) {
	r.server().post(xmlPath + 'addPortal.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 201);
	    done();
	});
    });

    it('should update testing portal', function (done) {
	r.server().put(xmlPath + 'updatePortal.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 204);
	    done();
	});
    });

    it('should return portal xml', function (done) {
	r.portal().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    done();
	});
    });


    it('should return portal rights', function (done) {
	r.portal().rights().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    done();
	});
    });

    it('should return portal tags', function (done) {
	r.portal().tag().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    done();
	});
    });
});

describe('Testing catalog methods', function () {

    it('should return server catalog with proper page size', function (done) {
	r.catalog().query({ps: 27}).get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    done();
	});
    });
    it('should return portal catalog', function (done) {
	r.catalog().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    done();
	});
    });

});

describe('Testing portal import methods', function () {

    it('Should post a portal', function (done) {
        r.import().post(xmlPath + 'addPortalImport.xml').then(function(d) {
            assert.propertyVal(d, 'statusCode', 201);
            done();
        });
    });
});


describe('Testing widget methods', function () {

    before(function() {
	//r.config.portal = 'myportal';
    });

    it('should return all widgets', function (done) {
	r.widget().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });
    it('should delete mywidget', function (done) {
	r.catalog('mywidget').delete().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 204);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });

    it('should create a widget', function (done) {
	r.portalCatalog().post(xmlPath + 'addWidget.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 204);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });
    it('should return my widget', function (done) {
	r.widget('mywidget').get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });
});

describe('Testing auto method', function () {

    it('should do server POST', function () {
        var j = {portals: { 
                        portal: { 
                            contextItemName: '[BBHOST]'
                        }
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['server', 'post']);
    });
    it('should do server PUT', function () {
        var j = {portal: { 
                            contextItemName: '[BBHOST]'
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['server', 'put']);
    });
    it('should do server catalog POST', function () {
        var j = {catalog: { 
                        widget: { 
                            contextItemName: '[BBHOST]'
                        }
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['catalog', 'post']);
    });
    it('should do server catalog PUT', function () {
        var j = {catalog: { 
                        widget: { 
                            contextItemName: '[BBHOST]'
                        }
                }},
            a = r.jxonToObj(j, 'put');
	    assert.deepEqual(a, ['catalog', 'put']);
    });
    it('should do portal catalog POST', function () {
        var j = {catalog: { 
                        widget: { 
                            contextItemName: 'myPortal'
                        }
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['portalCatalog', 'post']);
    });
    it('should do container POST', function () {
        var j = {containers: { 
                        container: { 
                            contextItemName: 'myPortal'
                        }
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['container', 'post']);
    });
    it('should do widget PUT', function () {
        var j = {widget: { 
                            contextItemName: 'myPortal'
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['widget', 'put']);
    });
    it('should do user POST', function () {
        var j = {users: {
                    user: {
                            username: 'myName'
                    }
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['user', 'post']);
    });
    it('should do user PUT', function () {
        var j = {user: { 
                            username: 'myName'
                }},
            a = r.jxonToObj(j);
	    assert.deepEqual(a, ['user', 'put']);
    });

    it('should auto create a widget', function (done) {
	r.auto(xmlPath + 'addWidget.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 204);
	    done();
	});
    });
});

describe('Testing all cache delete', function () {

    before(function () {
    });

    it('should delete all caches', function (done) {
	r.cache('all').delete().then(function(v) {
	    assert.propertyVal(v, 'statusCode', 204);
	    //assert.deepPropertyVal(v, 'body.portals.portal.length', 3);
	    done();
	});
    });

});


describe('Clean up...', function () {

    before(function () {
    });

    it("should remove testing portal", function(done) {
        r.portal().delete().then(function(d) {
            assert.propertyVal(d, 'statusCode', 204);
            done();
        });
    	
    });
    
});

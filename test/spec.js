
var r = new BBRest({portal: 'myBraveNewPortal', toJs: true});

describe('Testing server and portal methods', function () {

    before(function () {
    });

    it('should return portal list', function (done) {
	r.server().get().then(function(v) {
	    assert.propertyVal(v, 'statusCode', 200);
	    //assert.deepPropertyVal(v, 'body.portals.portal.length', 3);
	    done();
	});
    });

    it("should remove testing portal if it exists", function(done) {
        r.portal().delete().then(function(d) {
            assert.propertyVal(d, 'statusCode', 204);
            done();
        });
    	
    });
    
    it('should add testing portal', function (done) {
	r.server().post(xmlPath + 'addPortal.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 201);
	    done();
	});
    });

    it('should update testing portal and get portals xml', function (done) {
	r.server().put(xmlPath + 'updatePortal.xml').then(function(d) {
	    assert.propertyVal(d, 'statusCode', 204);
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

    it('should create a widget', function (done) {
	r.widget().post(xmlPath + 'addWidget.xml').then(function(d) {
            console.log(d);
	    assert.propertyVal(d, 'statusCode', 200);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });
    it('should return my widget', function (done) {
	r.widget('mywidget').xml().get().then(function(d) {
	    assert.propertyVal(d, 'statusCode', 200);
	    //var myw = _.find(d.body.widgets.widget, function(w) {return w.name[0] === 'mywidget';});
	    //console.log(myw.properties[0].property);
	    done();
	});
    });
});

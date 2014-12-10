var BBRest = require('../../dist/node/mosaic-rest-js'),
    chai = require('chai'),
    _ = require('lodash'),
    chaiAsPromised = require('chai-as-promised');

xmlPath = './test/xml/';
chai.should();
chai.use(chaiAsPromised);
chai.config.includeStack = true;

global.BBRest = BBRest;
global._ = _;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.should = chai.should;

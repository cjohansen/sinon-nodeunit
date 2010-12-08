/*jslint onevar: false*/
/*global require, setTimeout, exports*/
require("sinon-nodeunit");

exports.testSomething = function (test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testSomethingElse = function (test) {
    test.ok(false, "this assertion should fail");
    test.done();
};

var someAPI = {
    method: function () {
    }
};

exports.testWithStub = function (test) {
    test.stub(someAPI, "method").returns(42);
    test.equal(42, someAPI.method());
    test.done();
};

exports.testWithMock = function (test) {
    test.mock(someAPI).expects("method").returns(42).once();
    someAPI.method();
    test.done();
};

exports.testWithFakeTime = function (test) {
    var clock = test.useFakeTimers(0);
    var now;

    setTimeout(function () {
        now = new Date().getTime();
    }, 500);

    clock.tick(500);
    test.equal(500, now);
    test.done();
};

exports.testSinonAssertions = function (test) {
    var spy = test.spy();

    test.called(spy);
    test.done();
};

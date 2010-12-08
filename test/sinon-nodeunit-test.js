/*jslint onevar: false, eqeqeq: false, plusplus: false*/
/*global require, setTimeout*/
var sinon = require("sinon");
sinon.assert = require("sinon/assert");
var nucore = require("core");
var types = require("types");
var assert = require("assert");
var sys = require("sys");

var runTestSpy = sinon.spy(nucore, "runTest");
var typesTestSpy = sinon.spy(types, "test");

require("sinon-nodeunit");

// Should run the original runTest method
(function () {
    var opt = {};
    var test = sinon.spy();
    var callback = sinon.spy();
    nucore.runTest("some test", test, opt, callback);

    assert.ok(runTestSpy.called, "Should run original runTest");
    assert.equal("some test", runTestSpy.args[0][0]);
    assert.equal(opt, runTestSpy.args[0][2]);
    assert.equal(callback, runTestSpy.args[0][3]);
    assert.ok(test.called);
}());

// Should run the original types.test function
(function () {
    var opt = {};
    var callback = sinon.spy();
    types.test("some test", 0, opt, callback);

    assert.ok(typesTestSpy.calledWith("some test", 0, opt, callback),
              "Should run original types.test");
}());

// Should inject sandbox to test object
(function () {
    var opt = {};
    var callback = sinon.spy();
    var testObj = types.test("some test", 0, opt, callback);

    assert.equal(typeof testObj.spy, "function",
                 "Should add spy method to test object");
    assert.equal(typeof testObj.stub, "function",
                 "Should add stub method to test object");
    assert.equal(typeof testObj.sandbox, "object",
                 "Should add sandbox property to test object");
}());

// Should stub and restore method automatically
(function () {
    var objectUnderTest = {
        meth: function () {}
    };

    var origMeth = objectUnderTest.meth;
    var result;

    var testFn = function (test) {
        test.stub(objectUnderTest, "meth").returns(42);
        result = objectUnderTest.meth();

        test.done();
    };

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal(42, result);
    assert.equal(origMeth, objectUnderTest.meth);
}());

// Should restore method when test fails
(function () {
    var objectUnderTest = {
        meth: function () {}
    };

    var origMeth = objectUnderTest.meth;

    function testFn(test) {
        test.stub(objectUnderTest, "meth").returns(42);

        test.ok(false);
        test.done();
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal(origMeth, objectUnderTest.meth);
}());

// Should restore method when test throws
(function () {
    var objectUnderTest = {
        meth: function () {}
    };

    var origMeth = objectUnderTest.meth;

    function testFn(test) {
        test.stub(objectUnderTest, "meth").returns(42);
        throw new Error("Oops!");
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal(origMeth, objectUnderTest.meth);

    assert.throws(function () {
        runTestSpy.getCall(runTestSpy.callCount - 1).args[1]({
            sandbox: sinon.sandbox.create()
        });
    });
}());

// Should preserve return value
(function () {
    function testFn() {
        return 422;
    }

    nucore.runTest("some test", testFn, {}, function () {});

    assert.equal(422, runTestSpy.getCall(runTestSpy.callCount - 1).args[1]({
        sandbox: sinon.sandbox.create()
    }));
}());

// Should use fake timers
(function () {
    var result;

    function testFn(test) {
        var clock = test.useFakeTimers(0);

        setTimeout(function () {
            result = new Date().getTime();
        }, 400);

        clock.tick(400);
        test.done();
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal(400, result);
}());

// Should use fake timers always when configured to do so
(function () {
    sinon.config = {
        useFakeTimers: true
    };

    var result;

    function testFn(test) {
        setTimeout(function () {
            result = new Date().getTime();
        }, 800);

        test.clock.tick(800);
        test.done();
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal(800, result);
}());

// Should expose assertions
(function () {
    sinon.stub(sinon.assert, "called");

    function testFn(test) {
        var spy = test.spy();
        spy();

        test.called(spy);
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.ok(sinon.assert.called.called); // Whoa!
    sinon.assert.called.restore();
}());

// Should not expose sinon.assert.fail
(function () {
    sinon.stub(sinon.assert, "fail");

    function testFn(test) {
        test.fail("Oh noes!");
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.ok(!sinon.assert.fail.called);
}());

// Should not expose sinon.assert.pass
(function () {
    var type;

    function testFn(test) {
        type = typeof test.pass;
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal("undefined", type);
}());

// Should not expose sinon.assert.expose
(function () {
    var type;

    function testFn(test) {
        type = typeof test.expose;
    }

    nucore.runTest("some test", testFn, {}, function () {});
    assert.equal("undefined", type);
}());

// Should expose all assertions
(function () {
    var assertions;

    function testFn(test) {
        assertions = [[typeof test.called, "called"],
                      [typeof test.notCalled, "notCalled"],
                      [typeof test.callOrder, "callOrder"],
                      [typeof test.calledOnce, "calledOnce"],
                      [typeof test.calledTwice, "calledTwice"],
                      [typeof test.calledThrice, "calledThrice"],
                      [typeof test.callCount, "callCount"],
                      [typeof test.calledOn, "calledOn"],
                      [typeof test.alwaysCalledOn, "alwaysCalledOn"],
                      [typeof test.calledWith, "calledWith"],
                      [typeof test.calledWithExactly, "calledWithExactly"],
                      [typeof test.alwaysCalledWith, "alwaysCalledWith"],
                      [typeof test.alwaysCalledWithExactly, "alwaysCalledWithExactly"],
                      [typeof test.threw, "threw"],
                      [typeof test.alwaysThrew, "alwaysThrew"]];
    }

    nucore.runTest("some test", testFn, {}, function () {});

    for (var i = 0, l = assertions.length; i < l; ++i) {
        assert.equal("function", assertions[i][0], assertions[i][1]);
    }
}());

sys.puts("All OK!");

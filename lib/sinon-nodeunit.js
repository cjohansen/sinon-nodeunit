/*jslint onevar: false, eqeqeq: false*/
/*global require*/
require.paths.unshift(__dirname + "/../deps/nodeunit/lib");
require.paths.unshift(__dirname + "/../deps/sinon/lib");

var sinon = require("sinon");
sinon.sandbox = require("sinon/sandbox");
sinon.assert = require("sinon/assert");

var nodeunit = {
    core: require("core"),
    types: require("types")
};

var typesTest = nodeunit.types.test;

nodeunit.types.test = function () {
    var obj = typesTest.apply(this, arguments);
    var config = sinon.getConfig(sinon.config);
    config.useFakeServer = false;
    obj.sandbox = sinon.sandbox.create(config);
    obj.sandbox.inject(obj);

    obj.useFakeTimers = function () {
        return obj.sandbox.useFakeTimers.apply(obj.sandbox, arguments);
    };

    var assertion, method;

    for (assertion in sinon.assert) {
        if (sinon.assert.hasOwnProperty(assertion)) {
            method = sinon.assert[assertion];

            if (typeof method == "function" && assertion != "fail" &&
                assertion != "pass" && assertion != "expose") {
                obj[assertion] = obj.wrapAssert(assertion, assertion, method.length + 1, sinon.assert);
            }
        }
    }

    return obj;
};

var nuRunTest = nodeunit.core.runTest;

nodeunit.core.runTest = function () {
    var testFn = arguments[1];

    arguments[1] = function (test) {
        var exception, retVal;

        try {
            retVal = testFn.apply(this, arguments);
        } catch (e) {
            exception = e;
        }

        test.sandbox.verifyAndRestore();

        if (exception) {
            throw exception;
        }

        return retVal;
    };

    return nuRunTest.apply(this, arguments);
};

'use strict';
var dustjs = require('dustjs-linkedin'),
    test = require('tape'),
    engineMunger = require('../index'),
    testData = require('./fixtures/testConfig'),
    freshy = require('freshy');


test('engine-munger', function (t) {
    var settings = {cache: false};

    t.test('when no specialization or internationalization enabled for js engine', function (t) {
        var settings = {cache: false},
            config = clone(testData['none-js'].config);

        resetDust();
        engineMunger.js(settings, config)('test', {views: 'test/fixtures/.build'}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });

    t.test('when only specialization enabled for js engine', function (t) {
        var config = clone(testData['onlySpcl-js'].config),
            context = clone(testData['onlySpcl-js'].context);
        resetDust();
        engineMunger.js(settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Hyde</h1>');
            t.end();
        });
    });

    t.test('when only internationalization enabled for js engine', function (t) {
        var config = clone(testData['onlyIntl-js'].config),
            context = clone(testData['onlyIntl-js'].context);
        resetDust();
        engineMunger.js(settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Jekyll</h1>');
            t.end();
        });

    });

    t.test('when specialization and internationalization enabled for js engine', function (t) {
        var config = clone(testData['spclAndIntl-js'].config),
            context = clone(testData['spclAndIntl-js'].context);
        resetDust();
        engineMunger.js(settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Hyde</h1>');
            t.end();
        });

    });

    t.test('when no specialization or internationalization enabled for dust engine', function (t) {

        var config = clone(testData['none-dust'].config);

        resetDust();
        engineMunger.dust(settings, config)('test', {views: 'test/fixtures/templates'}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });


    t.test('using munger when only specialization enabled for dust engine', function (t) {

        var config = clone(testData['onlySpcl-dust'].config),
            context = clone(testData['onlySpcl-dust'].context);

        resetDust();
        engineMunger.dust(settings, config)('spcl/jekyll', context, function (err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello from hyde</h1>');
            t.end();
        });

    });

    t.test('using munger when only specialization enabled for dust engine with cache', function (t) {

        var config = clone(testData['onlySpcl-dust'].config),
            context = clone(testData['onlySpcl-dust'].context),
            setting = {cache: true};

        resetDust();
        engineMunger.dust(setting, config)('spcl/jekyll', context, function (err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello from hyde</h1>');
            t.end();
        });

    });

    t.test('when only internationalization is enabled for dust engine', function (t) {
        var config = clone(testData['onlyIntl-dust'].config),
            context = clone(testData['onlyIntl-dust'].context);
        resetDust();
        engineMunger.dust(settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Jekyll</h1>');
            t.end();
        });

    });


    t.test('when specialization/internationalization is enabled for dust engine', function(t) {
        var config = clone(testData['spclAndIntl-dust'].config),
            context = clone(testData['spclAndIntl-dust'].context);
        resetDust();

        engineMunger.dust(settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello from hyde</h1>');
            t.end();
        });
    });

    t.test('when specialization/internationalization is enabled for dust engine with cache', function(t) {
        var config = clone(testData['spclAndIntl-dust'].config),
            context = clone(testData['spclAndIntl-dust'].context),
            settings = {cache: true};
        resetDust();

        engineMunger.dust(settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello from hyde</h1>');
            t.end();
        });
    });


    t.test('i18n using view.render for js engine', function(t) {
        var config = clone(testData['onlyIntl-js'].config),
            context = clone(testData['onlyIntl-js'].context);
        resetDust();
        var engine = engineMunger.js(settings, config);

        engineMunger.js(settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Jekyll</h1>');
            t.end();
        });
    });

    t.test('i18n using view.render for js engine with caching', function(t) {
        var config = clone(testData['onlyIntl-js'].config),
            context = clone(testData['onlyIntl-js'].context),
            settings = {cache: true};
        resetDust();
        var engine = engineMunger.js(settings, config);

        engineMunger.js(settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Jekyll</h1>');
            t.end();
        });
    });

    t.test('when specialization/internationalization is enabled for dust engine with cache', function(t) {
        var config = clone(testData['spclAndIntl-dust'].config),
            context = clone(testData['spclAndIntl-dust'].context),
            settings = {cache: true};
        resetDust();

        engineMunger.dust(settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello from hyde</h1>');
            t.end();
        });
    });

    //error cases
    t.test('i18n with js engine- template not found case', function(t) {
        var config = clone(testData['onlyIntl-js'].config),
            context = clone(testData['onlyIntl-js'].context);
        resetDust();
        engineMunger.js(settings, config)('peekaboo', context, function(err, data) {
            t.equal(err.message, 'Could not load template peekaboo');
            t.equal(data, undefined);
            t.end();
        });

    });


    t.test('i18n dust engine- catch error while compiling invalid dust and report name of broken template', function(err, data) {

        var config = clone(testData['onlyIntl-dust'].config),
            context = clone(testData['onlyIntl-dust'].context);
        resetDust();
        engineMunger.dust(settings, config)('invalidTemp', context, function(err, data) {
            t.equal(err.message, 'Problem rendering dust template named invalidTemp: Expected end tag for elements but it was not found. At line : 5, column : 11');
            t.equal(data, undefined);
            t.end();
        });

    });

});

function resetDust() {
    var freshDust = freshy.freshy('dustjs-linkedin');
    dustjs.onLoad = freshDust.onLoad;
    dustjs.load = freshDust.load;
    dustjs.cache = freshDust.cache;
}

function clone(obj) {
    var out = {};
    for (var i in obj) {
        out[i] = obj[i];
    }

    return out;
}

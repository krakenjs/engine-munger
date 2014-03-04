'use strict';
var dustjs = require('dustjs-linkedin'),
    test = require('tape'),
    mockery = require('mockery'),
    engineMunger = require('../index'),
    adaro = require('adaro'),
    testData = require('./fixtures/testConfig'),
    app = {
        'views':null,
        'view engine': null,
        get: function(val) {
            return app[val];
        },
        set: function(param, val) {
            app[param] = val;
        },
        engines: {
            dust: function() {

            },
            js: function() {

            }
        }
    };


test('engine-munger', function (t) {

    appSetUp('js');
    t.test('when no specialization or internationalization enabled for js engine', function (t) {
        var config = testData.none.config,
            renderer = function (file, context) {
                t.equal(context._specialization, undefined);
                dustjs.onLoad('jekyll', context);
            };

        dustjs.onLoad = function(name, context, cb) {
            t.equal(name, 'jekyll');
            t.end();
        };
        engineMunger['js'](app, config, renderer)('test/fixtures/hyde', {});
    });

    t.test('when only specialization enabled for js engine', function (t) {
        var config = testData.onlySpcl.config,
            context = testData.onlySpcl.context,
            renderer = function (file, context) {
                t.deepEqual(context._specialization, {'spcl/jekyll': 'spcl/hyde'});
                dustjs.onLoad('spcl/jekyll', context, function(err, data){
                    t.equal(err, null);
                    t.notEquals((''+data).indexOf('Hola Hyde'), -1);
                    t.end();
                });
            };

        engineMunger['js'](app, config, renderer)('test/fixtures/hyde', context);

    });

    t.test('when only internationalization enabled for js engine', function (t) {

        var config = testData.onlyIntl.config,
            context = testData.onlyIntl.context,
            renderer = function (file, context) {
                t.equal(context._specialization, undefined);
                dustjs.onLoad('jekyll', context, function(err, data){
                    t.equal(err, null);
                    t.notEquals((''+data).indexOf('Hola Jekyll'), -1);
                    t.end();
                });
            };

        engineMunger['js'](app, config, renderer)('jekyll', context);

    });

    t.test('when specialization and internationalization enabled for js engine', function (t) {

        var config = testData.spclAndIntl.config.js,
            context = testData.spclAndIntl.context,
            renderer = function (file, context) {
                t.deepEqual(context._specialization, {'spcl/jekyll': 'spcl/hyde'});
                dustjs.onLoad('spcl/jekyll', context, function(err, data){
                    t.equal(err, null);
                    t.notEquals((''+data).indexOf('Hola Hyde'), -1);
                    t.end();
                });
            };

        engineMunger['js'](app, config, renderer)('jekyll', context);

    });


    t.test('when no specialization or internationalization enabled for dust engine', function (t) {
        appSetUp('dust');
        var config = testData.none.config,
            renderer = function (file, context) {
                t.equal(context._specialization, undefined);
                dustjs.onLoad('jekyll', context, function() {
                    t.end();
                });
            };

        dustjs.onLoad = function(name, context, cb) {
            t.equal(name, 'jekyll');
            t.end();
        };
        engineMunger['dust'](app, config, renderer)('hyde', {});
    });

    t.test('using munger when only specialization enabled for dust engine', function (t) {
        var config = testData.onlySpcl.config,
            context = testData.onlySpcl.context,
            renderer = function (file, context) {
                t.deepEqual(context._specialization, {'spcl/jekyll': 'spcl/hyde'});
                dustjs.onLoad('spcl/jekyll', context, function(err, data){
                    t.equal(err, null);
                    t.equal(data, '<h1>Hello from hyde</h1>');
                    t.end();
                });
            };

        engineMunger['dust'](app, config, renderer )('specl/jekyll', context, function(err, data) {
            t.end();
        });

    });


    t.test('when only internationalization is enabled for dust engine', function (t) {

        var config = testData.onlyIntl.config,
            context = testData.onlyIntl.context;
        doMockeryStuff(function renderer (file, context, cb) {
            t.deepEqual(context._specialization, undefined);
            dustjs.onLoad('jekyll', context, function(err, data){
                var res = JSON.stringify('' + data);

                t.equal(err, null);
                t.notEquals(res.indexOf('Hola Jekyll'), -1);
                mockery.disable();
                t.end();
            });

        });
        engineMunger['dust'](app, config)('test/fixtures/templates/jekyll', context);

    });


    t.test('when specialization/internationalization is enabled for dust engine', function(t) {
        var config = testData.spclAndIntl.config.dust,
            context = testData.spclAndIntl.context;
        doMockeryStuff(function renderer (file, context, cb) {
            t.deepEqual(context._specialization, {jekyll: 'hyde'});
            dustjs.onLoad('jekyll', context, function(err, data) {
                var res = JSON.stringify('' + data);
                t.equal(err, null);
                t.notEquals(res.indexOf('Hola Hyde'), -1);
                mockery.disable();
                t.end();
            });

        });
        engineMunger['dust'](app, config)('test/fixtures/templates/jekyll', context);
    });

});

//*****************************************************
//The following functions are used for some test setup
//*****************************************************

//have to use mockery as internally for i18n
//we switch the engine using adaro for js engine

function doMockeryStuff(renderer) {
    mockery.enable({
        warnOnUnregistered: false,
        useCleanCache: true
    });
    mockery.registerMock('adaro', {
        js: function() {
            return renderer;
        }
    });

    adaro = require('adaro');
    engineMunger = require('../index');
    dustjs = require('dustjs-linkedin');
}

// do app setUp
function appSetUp(mode) {
    if (mode === 'js') {
        app.set('views', 'test/fixtures/.build');
        app.set('view engine', 'js');
    } else {
        app.set('views', 'test/fixtures/templates');
        app.set('view engine', 'dust');
    }
}
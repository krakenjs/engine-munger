'use strict';
var dustjs = require('dustjs-linkedin'),
    test = require('tape'),
    testData = require('./fixtures/testConfig'),
    sandboxedModule = require('sandboxed-module'),
    fakeAdaro = require('./fixtures/adaro')(dustjs),
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

var engineMunger = sandboxedModule.require('../index', {
    requires: {
        'adaro': fakeAdaro
    }
});
test('engine-munger', function (t) {
    appSetUp('js');
    t.test('when no specialization or internationalization enabled for js engine', function (t) {
        var config = testData.none.config,
            renderer = fakeAdaro['js']();

        engineMunger['js'](app, config, renderer)('test/fixtures/hyde', {}, function(err, data){
            t.equals(err, null);
            t.equals(data, 'success');
            t.end();
        });
    });

    t.test('when only specialization enabled for js engine', function (t) {
        var config = testData.onlySpcl.config,
            context = testData.onlySpcl.context,
            renderer = fakeAdaro['js']();

        engineMunger['js'](app, config, renderer)('hyde', context, function(err, data){
            console.info('data' , data);
            t.end();
        });
    });

    /*t.test('when only internationalization enabled for js engine', function (t) {

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


   /* t.test('when no specialization or internationalization enabled for dust engine', function (t) {
        appSetUp('dust');
        var config = testData.none.config,
            renderer = function (file, context) {
                t.equal(context._specialization, undefined);
                fakeAdaro.onLoad('jekyll', context, function(err, data) {
                    t.equal(err, null);
                    t.equal(data, 'success');
                    t.end();
                });
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
        fakeAdaro.setRenderer(function renderer (file, context, cb) {
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
        fakeAdaro.setRenderer(function renderer (file, context, cb) {
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
*/
});

//*****************************************************
//The following functions are used for some test setup
//*****************************************************


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
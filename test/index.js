'use strict';
var dustjs = require('dustjs-linkedin'),
    test = require('tape'),
    mockery = require('mockery'),
    engineMunger = require('../index'),
    adaro,
    app = {
        get: function(val) {
            switch(val) {
                case 'view engine':
                    return 'dust';
                    break;
                case 'views':
                    return 'test/fixtures/templates';
                    break;
            };
        },
        engines: {
            dust: function() {

            },
            js: function() {

            }
        }
    };


test('specializr', function (t) {

   t.test('using munger when no specialization or internationalization enabled for dust engine', function (t) {
        var config = {
                i18n: null,
                specialization: null
            },
            renderer = function (file, context) {
                t.equal(context._specialization, undefined);
                dustjs.onLoad('jekyll', context);
            };

        dustjs.onLoad = function(name, context, cb) {
            t.equal(name, 'jekyll');
            t.end();
        };
        engineMunger['dust'](app, config, renderer)('test/fixtures/hyde', {});
    });

    t.test('using munger when only specialization enabled for dust engine', function (t) {
        var config = {
                i18n: null,
                specialization: {
                    jekyll: [
                        {
                           template: 'hyde',
                            rules: {
                                'whoAmI': 'badGuy'
                            }
                        }
                    ]

                }
            },
            context = {'whoAmI': 'badGuy'},
            renderer = function (file, context) {
                t.deepEqual(context._specialization, {'jekyll': 'hyde'});
                dustjs.onLoad('jekyll', context);
            };

        dustjs.onLoad = function(name, context, cb) {
            t.equal(name, 'hyde');
            t.end();
        };

        engineMunger['dust'](app, config, renderer)('test/fixtures/hyde', context);

    });


    t.test('using munger when only internationalization is enabled for dust engine', function (t) {

        var config = {
                i18n: {
                    "fallback": "en-US",
                    "contentPath": "test/fixtures/properties"
                },
                specialization: null
            },
            context = {
                get: function() {
                    return {
                        locality: 'es_US'
                    }
                }
            };
        doMockeryStuff(function renderer (file, context, cb) {
            t.deepEqual(context._specialization, undefined);
            dustjs.onLoad('jekyll', context, function(err, data){
                var res = JSON.stringify('' + data);
                t.equal(err, null);
                t.equal(res, '\"function body_0(chk,ctx){return chk.write(\\\"<h1>Hola Jekyll</h1>\\\");}\"');
                mockery.disable();
                t.end();
            });

        });
        engineMunger['dust'](app, config)('test/fixtures/templates/jekyll', context);

    });


    t.test('using munger when specialization/internationalization is enabled for dust engine', function(t) {
        var config = {
                "i18n": {
                    "fallback": "en-US",
                    "contentPath": "test/fixtures/properties"
                },
                specialization: {
                    jekyll: [
                        {
                            template: 'hyde',
                            rules: {
                                'whoAmI': 'badGuy'
                            }
                        }
                    ]

                }
            },
            context = {
                'whoAmI': 'badGuy',
                get: function() {
                    return {
                        locality: 'es_US'
                    }
                }
            };
        doMockeryStuff(function renderer (file, context, cb) {
            t.deepEqual(context._specialization, {jekyll: 'hyde'});
            dustjs.onLoad('hyde', context, function(err, data) {
                var res = JSON.stringify('' + data);
                t.equal(err, null);
                t.equal(res, '\"function body_0(chk,ctx){return chk.write(\\\"<h1>Hola Hyde</h1>\\\");}\"');
                mockery.disable();
                t.end();
            });

        });
        engineMunger['dust'](app, config)('test/fixtures/templates/jekyll', context);
    });

});

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
'use strict';
var dustjs = require('dustjs-linkedin'),
    adaro = require('adaro'),
    test = require('tape'),
    engineMunger = require('../index'),
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

            }
        }
    };

test('specializr', function (t) {
    /*t.test('using munger when no specialization or internationalization enabled', function (t) {
        var config = {
                i18n: null,
                specialization: null
            },
            renderer = function (file, context) {
                dustjs.onLoad('jekyll', context);
            };

        dustjs.onLoad = function(name, context, cb) {
            t.equal(name, 'jekyll');
            t.end();
        };
        engineMunger['dust'](app, config, renderer)('', {});
    });*/

    t.test('using munger for generating engine wrappers -only specialization enabled', function (t) {
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
            renderer = function() {t.end();};

        dustjs.onLoad = function(name, context, cb) {
            console.info('calle dinto onlaod');
            t.equal(name, 'hyde');
            cb(null, '\<div>I am the bad guy</div>');

        };

        engineMunger['dust'](app, config, renderer)('', context);

    });

    /*t.test('using munger for generating engine wrappers - specialization/internationalization enabled for dust', function(t) {
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
            renderer = function (file, context) {
                dustjs.onLoad('jekyll', context, function(err, data) {
                    console.info('data...',data);
                    console.info(typeof data);
                    t.deepEqual(data, function body_0(chk,ctx){return chk.write("<h1>Hello Hyde</h1>");});
                    t.deepEqual(JSON.stringify(context),JSON.stringify({'whoAmI': 'badGuy', '_specialization': {'jekyll':'hyde'}}) );
                });
            },
            context = {
                'whoAmI': 'badGuy',
                'get' : function(val) {
                    if (val === 'context') {
                        return {
                            locality:{
                                locale: 'en_US',
                                country: 'US',
                                language: 'en'
                            }
                        }
                    }
                }};
        engineMunger['dust'](app, config, renderer)('', context);
        t.end();

    });*/
});

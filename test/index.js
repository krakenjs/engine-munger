'use strict';
var test = require('tap').test;
var engineMunger = require('../index');
var freshy = require('freshy');
var makeViewClass = require('../lib/expressView').makeViewClass;
var path = require('path');

test('engine-munger', function (t) {
    var settings = {cache: false};

    t.test('when no specialization or internationalization enabled for js engine', function (t) {
        makeView('js', 'test', {}).render({}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });

    t.test('when only specialization enabled for js engine', function (t) {
        var conf = {
            specialization: {
                'spcl/jekyll': [
                    {
                        is: 'spcl/hyde',
                        when: {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]
            }
        }
        makeView('js', 'spcl/jekyll', conf).render({ whoAmI: 'badGuy' }, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>☃greeting☃ Hyde</h1>');
            makeView('js', 'spcl/jekyll', conf).render({ whoAmI: 'goodGuy' }, function(err, data) {
                t.equal(err, null);
                t.equal(data, '<h1>☃greeting☃ Jekyll</h1>');
                t.end();
            });
        });
    });

    t.test('when only internationalization enabled for js engine', function (t) {
        var config = {
            i18n: {
                fallback: 'en-US',
                formatPath: krakenFormatPath,
                contentPath: 'test/fixtures/properties'
            }
        };
        var context = {
            locale: 'es_US'
        };

        makeView('js', 'jekyll', config).render(context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            t.end();
        });

    });

    t.test('when specialization and internationalization enabled for js engine', function (t) {
        var config = {
            i18n: {
                fallback: 'en-US',
                formatPath: krakenFormatPath,
                contentPath: 'test/fixtures/properties'
            },
            specialization: {
                'spcl/jekyll': [
                    {
                        is: 'spcl/hyde',
                        when: {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]

            }
        };

        var context1 = {
            whoAmI: 'badGuy',
            locale: 'es_US'
        };

        var context2 = {
            whoAmI: 'goodGuy',
            locale: 'es_US'
        };

        var context3 = {
            whoAmI: 'badGuy',
            locale: 'en_US'
        };

        var context4 = {
            whoAmI: 'goodGuy',
            locale: 'en_US'
        };

        makeView('js', 'spcl/jekyll', config).render(context1, checkContext1);

        function checkContext1(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Señor Hyde</h1>');
            makeView('js', 'spcl/jekyll', config).render(context2, checkContext2);
        }

        function checkContext2(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            makeView('js', 'spcl/jekyll', config).render(context3, checkContext3);
        }

        function checkContext3(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello Mister Hyde</h1>');
            makeView('js', 'spcl/jekyll', config).render(context4, checkContext4);
        };

        function checkContext4(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hello Doctor Jekyll</h1>');
            t.end();
        }

    });

    t.test('when no specialization or internationalization enabled for dust engine', function (t) {

        var config = {};

        makeView('dust', 'test', {}).render({}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });


    t.test('using munger when only specialization enabled for dust engine', function (t) {

        var config = {
             specialization: {
                'spcl/jekyll': [
                    {
                        is: 'spcl/hyde',
                        when: {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]
            }
        };

        var context = { 'whoAmI': 'badGuy' };

        makeView('dust', 'spcl/jekyll', config).render(context, function (err, data) {
            t.equal(err, null);
            t.equal(data, '<h1> Hyde</h1>');
            t.end();
        });

    });

    //error cases
    t.test('i18n with js engine- template not found case', function(t) {
        var config = {
            i18n: {
                fallback: 'en-US',
                formatPath: krakenFormatPath,
                contentPath: 'test/fixtures/properties'
            }
        };
        makeView('js', 'peekaboo', config).render({}, function(err, data) {
            t.ok(/Failed to lookup view "peekaboo" in views directory/.test(err.message));
            t.equal(data, undefined);
            t.end();
        });
    });


    t.test('i18n dust engine- catch error while compiling invalid dust and report name of broken template', function(err, data) {
        var config = {
            i18n: {
                fallback: 'en-US',
                formatPath: krakenFormatPath,
                contentPath: 'test/fixtures/properties'
            }
        };

        var context = {
            locale: 'es_US'
        };

        makeView('dust', 'invalidTemp', config).render(context, function(err, data) {
            t.equal(err.message, 'Problem rendering dust template named invalidTemp: Expected end tag for elements but it was not found. At line : 5, column : 11');
            t.equal(data, undefined);
            t.end();
        });

    });

});

function makeView(ext, tmpl, config) {
    var viewConf = {};
    viewConf[ext] = config;
    var View = makeViewClass(viewConf);
    var engines = {};
    engines['.' + ext] = engineMunger[ext]();
    return new View(tmpl, {
        root: ext == 'js' ? path.resolve(__dirname, 'fixtures/.build') : path.resolve(__dirname, 'fixtures/templates'),
        defaultEngine: '.' + ext,
        engines: engines
    });
}

function krakenFormatPath(locale) {
    return locale.langtag.region + '/' + locale.langtag.language.language;
}

'use strict';
var test = require('tap').test;
var makeViewClass = require('../');
var path = require('path');
var adaro = require('adaro');

test('engine-munger', function (t) {

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
            t.match(err.message, /Failed to lookup view "peekaboo.js" in directory/);
            t.equal(data, undefined);
            t.end();
        });
    });


    t.test('dust engine - catch error while compiling invalid dust and report name of broken template', function(t) {
        var config = {
        };

        var context = {
            locale: 'es_US'
        };

        makeView('dust', 'invalidTemp', config).render(context, function(err, data) {
            t.match(err.message, /Problem rendering dust template ".*": Expected end tag for elements but it was not found. At line : 5, column : 11/);
            t.equal(data, undefined);
            t.end();
        });

    });

    t.test('early lookupMain and cached behavior', function (t) {
        var view = makeView('js', 'test', {});
        view.lookupMain({}, function (err) {
            t.error(err);
            t.equal(view.path, path.resolve(__dirname, 'fixtures', '.build', 'test.js'));
            view.lookupMain({}, function(err) {
                t.error(err);
                t.end();
            });
        });
    });

    t.test('multiple roots - found', function (t) {
        var view = makeView('dust', 'test', {
            root: [
                path.resolve(__dirname, 'fixtures', 'not-here'),
                path.resolve(__dirname, 'fixtures', 'templates')
            ]
        });
        view.lookupMain({}, function (err) {
            t.error(err);
            t.equal(view.path, path.resolve(__dirname, 'fixtures', 'templates', 'test.dust'));
            t.end();
        });
    });

    t.test('multiple roots - not found', function (t) {
        var path1 = path.resolve(__dirname, 'fixtures', 'not-here');
        var path2 = path.resolve(__dirname, 'fixtures', 'nor-there')
        var view = makeView('dust', 'test', {
            root: [
                path1,
                path2
            ]
        });
        view.lookupMain({}, function (err) {
            t.match(err.message, /Failed to lookup view "test.dust"/);
            t.match(err.message, /not-here/);
            t.match(err.message, /nor-there/);
            t.same(view.path, true);
            t.end();
        });
    });

    t.test('multiple roots - deferred stat', function (t) {
        var view = makeView('dust', 'test', { });
        var pending = 0;
        for (var i = 0; i < 11; i++) {
            pending++;
            view.lookup('test.dust', {}, function (err) {
                t.error(err);
                if (--pending === 0) {
                    t.end();
                }
            });
        }
    });

    t.test('lookup in a submodule', function (t) {
        var view = makeView('dust', 'test', { });
        view.lookup('module:test-package-templates/test.dust', {}, function (err) {
            t.error(err);
            t.end();
        });
    });
});

function makeView(ext, tmpl, config) {
    // This function wraps the tricky business of instantiating an Express View.
    // It's got a constrained and strange interface because it comes from the
    // private internals of Express.
    //
    // The interface to the constructor is so constrained that configuration has
    // to happen before that -- so we actually make a class dynamically whose
    // instances come pre-configured.

    var viewConf = {};

    // The full configuration is a map of extension -> configuration, so
    // configuration can vary by file type. We simplify that to a single
    // extension for the tests.
    viewConf[ext] = config;
    var View = makeViewClass(viewConf);
    var engines = {};

    // Inside express, the View class gets a reference to the configured
    // view engines. Not how I would have factored it, but it works. We
    // emulate that here with just adaro.
    engines['.' + ext] = adaro[ext]();

    // The assumption is also that the view filename is qualified with the
    // extension. This simplifies the guts a lot since ext isn't passed in
    // different places at different times.
    tmpl += '.' + ext;

    // So then we return an instance of the View itself, as Express would
    // do internally in normal use. The keys passed are the only ones
    // Express will pass, hence the need for configuration above.
    return new View(tmpl, {
        root: config.root ? config.root : ext == 'js' ? path.resolve(__dirname, 'fixtures/.build') : path.resolve(__dirname, 'fixtures/templates'),
        defaultEngine: '.' + ext,
        engines: engines
    });
}

function krakenFormatPath(locale) {
    return locale.langtag.region + '/' + locale.langtag.language.language;
}

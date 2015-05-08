'use strict';
var test = require('tape'),
    engineMunger = require('../index'),
    testData = require('./fixtures/testConfig'),
    freshy = require('freshy');


test('engine-munger', function (t) {
    var settings = {cache: false};

    t.test('when no specialization or internationalization enabled for js engine', function (t) {
        var settings = {cache: false},
            config = testData['none-js'].config;

        engineMunger['js'](settings, config)('test', {views: 'test/fixtures/.build'}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });

    t.test('when only specialization enabled for js engine', function (t) {
        var config = testData['onlySpcl-js'].config;
        var context1 = testData['onlySpcl-js'].context1;
        var context2 = testData['onlySpcl-js'].context2;
        var engine = engineMunger['js'](settings, config);
        engine('spcl/jekyll', context1, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>☃greeting☃ Hyde</h1>');
            engine('spcl/jekyll', context2, function(err, data) {
                t.equal(err, null);
                t.equal(data, '<h1>☃greeting☃ Jekyll</h1>');
                t.end();
            });
        });
    });

    t.test('when only internationalization enabled for js engine', function (t) {
        var config = testData['onlyIntl-js'].config,
            context = testData['onlyIntl-js'].context;
        engineMunger['js'](settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            t.end();
        });

    });

    t.test('when specialization and internationalization enabled for js engine', function (t) {
        var config = testData['spclAndIntl-js'].config;
        var context1 = testData['spclAndIntl-js'].context1;
        var context2 = testData['spclAndIntl-js'].context2;
        var engine = engineMunger['js'](settings, config);
        engine('spcl/jekyll', context1, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Señor Hyde</h1>');
            engine('spcl/jekyll', context2, function(err, data) {
                t.equal(err, null);
                t.equal(data, '<h1>Hola Don Jekyll</h1>');
                t.end();
            });
        });

    });

    t.test('when no specialization or internationalization enabled for dust engine', function (t) {

        var config = testData['none-dust'].config;

        engineMunger['dust'](settings, config)('test', {views: 'test/fixtures/templates'}, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hey Test</h1>');
            t.end();
        });
    });


    t.test('using munger when only specialization enabled for dust engine', function (t) {

        var config = testData['onlySpcl-dust'].config,
            context = testData['onlySpcl-dust'].context;

        engineMunger['dust'](settings, config)('spcl/jekyll', context, function (err, data) {
            t.equal(err, null);
            t.equal(data, '<h1> Hyde</h1>');
            t.end();
        });

    });

    t.test('using munger when only specialization enabled for dust engine with cache', function (t) {

        var config = testData['onlySpcl-dust'].config,
            context = testData['onlySpcl-dust'].context,
            setting = {cache: true};

        engineMunger['dust'](setting, config)('spcl/jekyll', context, function (err, data) {
            t.equal(err, null);
            t.equal(data, '<h1> Hyde</h1>');
            t.end();
        });

    });

    t.test('when only internationalization is enabled for dust engine', function (t) {
        var config = testData['onlyIntl-dust'].config,
            context = testData['onlyIntl-dust'].context;
        engineMunger['dust'](settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            t.end();
        });

    });


    t.test('when specialization/internationalization is enabled for dust engine', function(t) {
        var config = testData['spclAndIntl-dust'].config,
            context = testData['spclAndIntl-dust'].context;

        engineMunger['dust'](settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Señor Hyde</h1>');
            t.end();
        });
    });

    t.test('when specialization/internationalization is enabled for dust engine with cache', function(t) {
        var config = testData['spclAndIntl-dust'].config,
            context = testData['spclAndIntl-dust'].context,
            settings = {cache: true};

        engineMunger['dust'](settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Señor Hyde</h1>');
            t.end();
        });
    });


    t.test('i18n using view.render for js engine', function(t) {
        var config = testData['onlyIntl-js'].config,
            context = testData['onlyIntl-js'].context;
        var engine = engineMunger['js'](settings, config);

        engineMunger['js'](settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            t.end();
        });
    });

    t.test('i18n using view.render for js engine with caching', function(t) {
        var config = testData['onlyIntl-js'].config,
            context = testData['onlyIntl-js'].context,
            settings = {cache: true};
        var engine = engineMunger['js'](settings, config);

        engineMunger['js'](settings, config)('jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Don Jekyll</h1>');
            t.end();
        });
    });

    t.test('when specialization/internationalization is enabled for dust engine with cache', function(t) {
        var config = testData['spclAndIntl-dust'].config,
            context = testData['spclAndIntl-dust'].context,
            settings = {cache: true};

        engineMunger['dust'](settings, config)('spcl/jekyll', context, function(err, data) {
            t.equal(err, null);
            t.equal(data, '<h1>Hola Señor Hyde</h1>');
            t.end();
        });
    });

    //error cases
    t.test('i18n with js engine- template not found case', function(t) {
        var config = testData['onlyIntl-js'].config,
            context = testData['onlyIntl-js'].context;
        engineMunger.js(settings, config)('peekaboo', context, function(err, data) {
            t.equal(err.message, 'Could not load template peekaboo');
            t.equal(data, undefined);
            t.end();
        });

    });


    t.test('i18n dust engine- catch error while compiling invalid dust and report name of broken template', function(err, data) {

        var config = testData['onlyIntl-dust'].config,
            context = testData['onlyIntl-dust'].context;
        engineMunger.dust(settings, config)('invalidTemp', context, function(err, data) {
            t.equal(err.message, 'Problem rendering dust template named invalidTemp: Expected end tag for elements but it was not found. At line : 5, column : 11');
            t.equal(data, undefined);
            t.end();
        });

    });

});

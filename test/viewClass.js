var test = require('tap').test;
var makeViewClass = require('../lib/expressView').makeViewClass;
var path = require('path');

test('view class lookup plain', function (t) {
    var View = makeViewClass({});
    var v = new View('test', {
        root: path.resolve(__dirname, 'fixtures/templates'),
        defaultEngine: '.dust',
        engines: {
            '.dust': fakeEngine
        }
    });
    v.lookup('test.dust', {}, function (err, result) {
        t.error(err);
        t.equal(result, path.resolve(__dirname, 'fixtures/templates/test.dust'));
        t.end();
    });
});

test('view class lookup i18n', function (t) {
    var View = makeViewClass({
        ".js": {
            "i18n": {
                "fallback": "en-US",
                "formatPath": function (locale) {
                    return path.join(locale.langtag.region, locale.langtag.language.language);
                }
            }
        }
    });
    var v = new View('test', {
        root: path.resolve(__dirname, 'fixtures/.build'),
        defaultEngine: '.js',
        engines: {
            '.js': fakeEngine
        }
    });
    v.lookup('test.js', {}, function (err, result) {
        t.error(err);
        t.equal(result, path.resolve(__dirname, 'fixtures/.build/US/en/test.js'));
        t.end();
    });
});

test('view class lookupMain', function (t) {
    var View = makeViewClass({});
    var v = new View('test', {
        root: path.resolve(__dirname, 'fixtures/templates'),
        defaultEngine: '.dust',
        engines: {
            '.dust': fakeEngine
        }
    });
    v.lookupMain({}, function (err) {
        t.error(err);
        t.equal(v.path, path.resolve(__dirname, 'fixtures/templates/test.dust'));
        t.end();
    });
});

function fakeEngine() {
    console.log('fake engine called', arguments);
}

var test = require('tap').test;
var MungedView = require('../lib/expressView').makeViewClass({});
var setupViewClass = require('../lib/expressView');
var express = require('express');
var supertest = require('supertest');
var path = require('path');

test('view class lookup', function (t) {
    var v = new MungedView('test', {
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

test('view class lookupMain', function (t) {
    var v = new MungedView('test', {
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

test('first-run middleware', function (t) {
    var app = express();
    var view, afterView;

    app.set('view engine', 'fake');
    app.engine('fake', fakeEngine);
    app.use(function (req, res, next) {
        view = app.get('view');
        t.ok(view);
        next();
    });
    app.use(setupViewClass({stuff: true}));
    app.use(function (req, res, next) {
        afterView = app.get('view');
        t.ok(afterView);
        next();
    });
    app.get('/', function (req, res) {
        res.end('got it');
    });

    supertest(app).get('/').end(function (err, res) {
        t.error(err);
        t.ok(res);
        t.notEqual(afterView, view);
        t.end();
    });

});

function fakeEngine() {
    console.log('fake engine called', arguments);
}

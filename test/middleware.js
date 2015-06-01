var test = require('tap').test;
var View = require('../')({});
var setupViewClass = require('../middleware');
var express = require('express');
var supertest = require('supertest');
var path = require('path');

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
    app.use(setupViewClass({
        i18n: {
            contentPath: path.resolve(__dirname, 'fixtures', 'properties')
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
    }));
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

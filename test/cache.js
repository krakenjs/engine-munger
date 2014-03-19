'use strict';
var cash = require('../lib/cache'),
    test = require('tape');

test('cache', function (t) {
    var cache,
        invoked = false;

    t.test('create cache success', function(t) {
        var provider = function(name, context, cb) {
        };
        cache = cash.create(provider, 'en_US');
        t.equal(typeof cache, 'object');
        t.equal(typeof cache.dataProvider, 'function');
        t.deepEqual(cache.fallback, {"language":"en","country":"US"});
        cache.dataProvider = provider;
        cache.fallback = {"language":"de","country":"DE"};
        t.equal(typeof cache.dataProvider, 'function');
        t.deepEqual(cache.fallback, {"language":"de","country":"DE"});
        t.end();
    });


    t.test('cache get hits the provider function', function (t) {
        var provider = function(name, context, cb) {
                invoked = true;
                cb(null, 'Test');
            };
        cache = cash.create(provider, 'en_US');
        cache.get('test', {locality: {country: 'US', language: 'es'}}, function (err, data) {
            t.equal(err, null);
            t.equal(data, 'Test');
            t.equal(invoked, true);
            t.end();
        });
    });

    t.test('cache get does not hit the provider function', function (t) {
        invoked = false;
        cache.get('test', {locality: {country: 'US', language: 'es'}}, function (err, data) {
            t.equal(err, null);
            t.equal(data, 'Test');
            t.equal(invoked, false);
            t.end();
        });
    });

    t.test('cache reset', function (t) {
        cache.reset();
        cache.get('test', {locality: {country: 'US', language: 'es'}}, function (err, data) {
            t.equal(err, null);
            t.equal(data, 'Test');
            t.equal(invoked, true);
            t.end();
        });
    });
});
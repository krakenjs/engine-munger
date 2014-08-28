"use strict";

var bcp47 = require('bcp47');
var fs = require('fs');
var path = require('path');
var permutron = require('permutron');

module.exports = function searchLocales(root, name, locales, callback) {
    permutron(root, name, locales, function (root, name, loc, next) {
        var locale;
        try {
            locale = bcp47.parse(loc.replace('_', '-')).langtag;
        } catch (e) {
            return callback(e);
        }

        var file = path.join(root, locale.region, locale.language && locale.language.language, name);

        fs.exists(file, function (exists) {
            if (exists) {
                return callback(null, file);
            } else {
                return next();
            }
        });
    }, function () {
        return callback(new Error("not found"));
    });

};

"use strict";

var bcp47 = require('bcp47');
var fs = require('fs');
var path = require('path');

module.exports = function searchLocales(root, name, locales, callback) {
    if (!locales[0]) {
        return callback(new Error("not found"));
    }

    var locale;
    try {
        locale = bcp47.parse(locales[0].replace('_', '-')).langtag;
    } catch (e) {
        return callback(e);
    }

    var file = path.join(root, locale.region, locale.language && locale.language.language, name);

    fs.exists(file, function (exists) {
        if (exists) {
            return callback(null, file);
        } else {
            return searchLocales(root, name, locales.slice(1), callback);
        }
    });
};

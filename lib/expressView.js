/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
"use strict";
var resolver = require('file-resolver');
var util = require('./util');
var path = require('path');
var debug = require('debuglog')('engine-munger');
var fs = require('fs');
var permutron = require('permutron');
var oldView = require('express/lib/view');
var karka = require('karka');
var aproba = require('aproba');

/**
 * Make a View class that uses our configuration, set far in advance of
 * instantiation because Express passes very little to the actual constructor.
 */
function makeViewClass(config) {
    aproba('O', arguments);

    var exts = prefixDots(config);

    var specialization = setupSpecialization(exts);

    var proto = Object.create(oldView.prototype);

    // Unfortunately, since we don't know the actual file to resolve until
    // we get request context (in `render`), we can't say whether it exists or not.
    //
    // Express checks that this is truthy to see if it should return an error or
    // run the render, so we hard code it to true.
    proto.path = true;

    proto.lookup = function lookup(name, options, cb) {
        if (arguments.length == 1) {
            // This is the unoverriden constructor calling us. Ignore the call.
            return true;
        }

        var ext = path.extname(name);

        if (specialization[ext]) {
            name = specialization[ext].resolve(name, options);
        }

        var search = [];
        search.push([].concat(exts[ext] && exts[ext].root ? exts[ext].root : this.root));

        if (exts[ext] && exts[ext].i18n) {
            var locales = [];
            search.push([options.locale, exts[ext].i18n.fallback].filter(function (e) { return e }));
        }

        search.push([name, path.join(path.basename(name), 'index' + ext)]);

        debug('lookup "%s"', name);

        permutron.raw(search, function (candidate, next) {
            debug("candidate %j", candidate);
            var resolved = path.resolve.apply(null, candidate);
            limitStat(resolved, function (err, stat) {
                if (!err && stat.isFile()) {
                    debug('found "%s"', resolved);
                    cb(null, resolved);
                } else if ((!err && stat.isDirectory()) || (err && err.code == 'ENOENT')) {
                    next();
                } else {
                    cb(err);
                }
            });
        }, cb);
    };

    /**
     * Render with the given `options` and callback `fn(err, str)`.
     *
     * @param {Object} options
     * @param {Function} fn
     * @api private
     */
    proto.render = function render(options, fn) {
        debug('render "%s"', this.path);
        if (!this.path || this.path === true) {
            this.lookupMain(options, function (err) {
                if (err) {
                    fn(err);
                } else {
                    this.engine(this.path, options, fn);
                }
            });
        }
        this.engine(this.path, options, fn);
    };

    /** Resolve the main template for this view
     *
     * @param {function} cb
     * @private
     */
    proto.lookupMain = function lookupMain(options, cb) {
        if (this.path && this.path !== true) return cb();
        var view = this;
        var name = path.extname(this.name) == this.ext
            ? this.name
            : this.name + this.ext;
        this.lookup(name, options, function (err, path) {
            if (err) {
                return cb(err);
            } else if (!path) {
                var dirs = Array.isArray(view.root) && view.root.length > 1
                    ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"'
                    : 'directory "' + view.root + '"'
                var viewError = new Error('Failed to lookup view "' + view.name + '" in views ' + dirs);
                viewError.view = view;
                return cb(viewError);
            } else {
                view.path = path;
                cb();
            }
        });
    };

    function View(name, options) {
        oldView.call(this, name, options);
    }

    View.prototype = proto;
    View.prototype.constructor = View;
    return View;
}

module.exports = function setupViewClass(options) {
    var opts = {};
    opts['.properties'] = {};
    opts['.js'] = {};
    opts['.dust'] = {};

    if (options.i18n) {
        opts['.properties'].root = [].concat(options.i18n.contentPath);
        opts['.properties'].i18n = {
            fallback: options.i18n.fallback
        };

        opts['.js'].i18n = {
            fallback: options.i18n.fallback
        };
    }

    if (options.specialization) {
        opts['.properties'].specialization = options.specialization;
        opts['.js'].specialization = options.specialization;
        opts['.dust'].specialization = options.specialization;
    }

    var hasConfiguredApp = false;
    return function (req, res, next) {
        if (!hasConfiguredApp) {
            req.app.set('view', makeViewClass(opts));
            hasConfiguredApp = true;
        }
        next();
    };
};

module.exports.makeViewClass = makeViewClass;

function enabledForExt(config, ext) {
    var extNoDot = ext.slice(1);
    return config.engines && (config.engines.indexOf(ext) !== -1 || config.engines.indexOf(extNoDot) != -1);
}


/**
 * an fs.stat call that limits the number of outstanding requests to 10.
 *
 * @param {String} path
 * @param {Function} cb
 */
var pendingStats = [];
var numPendingStats = 0;

function limitStat(path, cb) {
    debug('stat "%s"', path);
    if (++numPendingStats > 10) {
        pendingStats.push([path, cb]);
    } else {
        fs.stat(path, dequeue(cb));
    }

    function dequeue(cb) {
        return function (err, stat) {
            cb(err, stat);
            var next = pendingStats.shift();
            if (next) {
                fs.stat(next[0], dequeue(next[1]));
            } else {
                numPendingStats--;
            }
        };
    }
}

function prefixDots(config) {
    var out = {};
    for (var ext in config) {
        if (ext[0] == '.') {
            out[ext] = config[ext];
        } else {
            out['.' + ext] = config[ext];
        }
    }

    return out;
}

function setupSpecialization(config) {
    var out = {};

    for (var ext in config) {
        out[ext] = karka.create(config[ext]);
    }

    return out;
}

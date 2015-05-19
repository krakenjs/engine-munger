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

/**
 * Make a View class that uses our configuration, set far in advance of
 * instantiation because Express passes very little to the actual constructor.
 */
function makeViewClass(config) {
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

        var roots = [].concat(this.root);

        debug('lookup "%s"', name);

        function lookup(roots, callback) {
            var root = roots.shift();
            if (!root) {
                return callback(null, null);
            }
            debug("looking up '%s' in '%s' with ext '%s'", name, root, ext);

            // resolve the path
            var loc = path.resolve(root, name);
            var dir = path.dirname(loc);
            var file = path.basename(loc);

            // resolve the file
            resolveView(dir, file, ext, function (err, resolved) {
                if (err) {
                    return callback(err);
                } else if (resolved) {
                    return callback(null, resolved);
                } else {
                    return lookup(roots, callback);
                }
            });

        }

        return lookup(roots, cb);
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
    var hasConfiguredApp = false;
    return function (req, res, next) {
        if (!hasConfiguredApp) {
            req.app.set('view', makeViewClass(options));
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


/**
 * Resolve the file within the given directory.
 *
 * @param {string} dir
 * @param {string} file
 * @param {string} ext
 * @param {function} cb
 * @private
 */
function resolveView(dir, file, ext, cb) {
    var resolved = path.join(dir, file);
    limitStat(resolved, function (err, stat) {
        if (err && err.code == 'ENOENT') {
            // Skip down
        } else if (!err && stat && stat.isFile()) {
            return cb(null, resolved);
        }

        // <path>/index.<ext>
        resolved = path.join(dir, path.basename(file, ext), 'index' + ext);
        limitStat(resolved, function (err, stat) {
            if (err && err.code == 'ENOENT') {
                return cb(null, null);
            } else if (!err && stat && stat.isFile()) {
                return cb(null, resolved);
            } else {
                return cb(err || new Error("error looking up '" + resolved + "'"));
            }
        });
    });
}

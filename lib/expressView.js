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

var proto = {

    // Unfortunately, since we don't know the actual file to resolve until
    // we get request context (in `render`), we can't say whether it exists or not.
    //
    // Express checks that this is truthy to see if it should return an error or
    // run the render, so we hard code it to true.
    path: true,

    render: function (options, callback) {
        var locals, view, engine;

        locals = options && options.context;
        view = this.resolver.resolve(this.name, util.localityFromLocals(locals));

        // This is a bit of a hack to ensure we override `views` for the duration
        // of the rendering lifecycle. Unfortunately, `adaro` and `consolidate`
        // (https://github.com/visionmedia/consolidate.js/blob/407266806f3a713240db2285527de934be7a8019/lib/consolidate.js#L214)
        // check `options.views` but override with `options.settings.views` if available.
        // So, for this rendering task we need to override with the more specific root directory.
        options.settings = Object.create(options.settings);
        options.views = options.settings.views = view.root;

        this.engine(this.name, options, callback);
    }

};


function buildCtor(fallback, enginesToMunge, OriginalView) {
    var mungeable = [].concat(enginesToMunge).map(function (e) {
        return e[0] !== '.' ? '.' + e : e;
    });

    function View(name, options) {
        options = options || {};
        this.name = name;
        this.root = options.root;
        this.defaultEngine = options.defaultEngine;
        this.engines = options.engines;
        var engines = options.engines;
        this.defaultEngine = options.defaultEngine;
        var ext = this.ext = path.extname(name);
        if (!ext && !this.defaultEngine) {
            throw new Error('No default engine was specified and no extension was provided.');
        }

        if (!ext) {
            name += (ext = this.ext = ('.' !== this.defaultEngine[0] ? '.' : '') + this.defaultEngine);
        }

        this.engine = engines[ext] || (engines[ext] = require(ext.slice(1)).__express);

        if (~mungeable.indexOf(ext)) {
            this.resolver = resolver.create({
                root: options.root,
                ext: this.ext.slice(1),
                fallback: fallback
            });
        } else {
            debug("No specialization or i18n munging to do, punting to original Express View class");
            return new OriginalView(name, options);
        }
    }

    View.prototype = proto;
    View.prototype.constructor = View;
    return View;
}

module.exports = function setupViewClass(options) {
    if (!options || !options.fallback || !options.engines) {
        throw new Error("setupViewClass must be configured with a fallback locale and engines to munge");
    }

    var hasConfiguredApp = false;
    return function (req, res, next) {
        if (!hasConfiguredApp) {
            req.app.set('view', buildCtor(options.fallback, options.engines, req.app.get('view')));
            hasConfiguredApp = true;
        }
        next();
    };
};

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
var util = require('./util');
var searchLocales = require('./searchLocales');

var proto = {

    get path() {
        // Unfortunately, since we don't know the actual file to resolve until
        // we get request context (in `render`), we can't say whether it exists or not.
        return true;
    },

    render: function (options, callback) {
        var locals, view, engine;

        locals = options && options.context;
        var self = this;
        searchLocales(self.root, self.name + '.' + self.defaultEngine, [util.localityFromLocals(locals), self.fallback], function (err, view) {

            // This is a bit of a hack to ensure we override `views` for the duration
            // of the rendering lifecycle. Unfortunately, `adaro` and `consolidate`
            // (https://github.com/visionmedia/consolidate.js/blob/407266806f3a713240db2285527de934be7a8019/lib/consolidate.js#L214)
            // check `options.views` but override with `options.settings.views` if available.
            // So, for self rendering task we need to override with the more specific root directory.
            options.settings = Object.create(options.settings);
            options.views = options.settings.views = view.replace(self.name, '');

            engine = self.engines['.' + self.defaultEngine];
            engine(view, options, callback);
        });
    }

};


function buildCtor(fallback) {

    function View(name, options) {
        this.name = name;
        this.root = options.root;
        this.defaultEngine = options.defaultEngine;
        this.engines = options.engines;
        this.fallback = fallback;
    }

    View.prototype = proto;
    View.prototype.constructor = View;
    return View;
}

module.exports = function () {
    var view;
    return function (req, res, next) {
        var config = req.app.kraken;

        //if the view engine is 'js and if it has not been overridden already
        if (config.get('express:view engine') === 'js' && !view) {
            view = buildCtor(config.get('i18n:fallback'));
            req.app.set('view', view);
        }
        next();
    };
};




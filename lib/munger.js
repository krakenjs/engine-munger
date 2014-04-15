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
'use strict';
var views = require('../view'),
    util = require('./util'),
    dustjs = require('dustjs-linkedin'),
    cache = require('./cache'),
    fs = require('fs'),
    path = require('path');

//wrapEngine helps populate the context
//with the specialization map before
//dust.load is called
//this helps load the right specialized templates
//down the render work flow

exports.wrapEngine = function (config, engine) {
    var spclizr, module;

    if (config.specialization) {
        module = util.tryRequire('karka');
        spclizr = module && module.create(config.specialization);
        return function (file, options, callback) {
            //generate the specialization map
            options._specialization =  spclizr && spclizr.resolveAll(options);
            engine.apply(null, arguments);
        };
    } else {
        return engine;
    }
};

//wrapDustOnLoad makes sure every dust partial that is loaded
// has the right specialization/localization applied on it

exports.wrapDustOnLoad = function (ext, config, needCache, app) {
    var specialization,
        mappedName,
        conf = {},
        viewCache,
        i18n = config.i18n;

    var onLoad = (i18n) ? views[ext].create(config, app) : function load(name, context, cb) {
        var views, file;

        views = config.views;
        file = path.join(views, name + '.' + ext);
        fs.readFile(file, 'utf8', function (err, data) {
            cb.apply(undefined, arguments);
        });
    };
    //custom cache for all specialized or localized templates
    if (needCache) {
        viewCache = cache.create(onLoad, i18n ? i18n.fallback : '*');
        onLoad = viewCache.get.bind(viewCache);
    }
    dustjs.onLoad = function spclOnLoad(name, context, cb) {
        specialization = (typeof context.get === 'function' && context.get('_specialization')) || context._specialization;
        mappedName = (specialization && specialization[name] || name);
        onLoad(mappedName, context, function (err, data) {
            if (!err && mappedName !== name && typeof data === 'string') {
                //this is a workaround, since adaro is not aware of the mapped name up the chain
                //we find the dust.register line and replace the mappedName of template with original name
                data = data.replace(mappedName, name);
            }
            cb(null, data);
        });
    };
};
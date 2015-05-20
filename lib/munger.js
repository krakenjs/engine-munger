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
    fs = require('fs'),
    karka = require('karka'),
    path = require('path');

//wrapEngine helps populate the options
//with the specialization map before
//dust.load is called
//this helps load the right specialized templates
//down the render work flow

exports.wrapEngine = function (config, engine) {
    if (config.i18n) {
        engine = wrapForI18n(config, engine);
    }

    if (config.specialization) {
        engine = wrapForSpecialization(config, engine);
    }

    return engine;
};

function wrapForI18n(config, engine) {
    return function (file, options, callback) {
        if (!options.renderOptions) {
            options.renderOptions = {};
        }

        if (options.context) {
            options.renderOptions.locality = options.context.locality;
            options.renderOptions.contentLocality = options.context.contentLocality;
        }

        engine(file, options, callback);
    };
}

function wrapForSpecialization(config, engine) {
    var spclizr = karka.create(config.specialization.rules);
    return function (file, options, callback) {
        //generate the specialization map

        if (!options.renderOptions) {
            options.renderOptions = {};
        }

        try {
            options.renderOptions.specialization = spclizr && spclizr.resolveAll(options);
        } catch (e) {
            return callback(e);
        }

        engine(file, options, callback);
    };
}

//wrapDustOnLoad makes sure every dust partial that is loaded
// has the right specialization/localization applied on it

exports.wrapDustOnLoad = function (ext, dustjs, config) {
    var conf = {},
        i18n = config.i18n;

    var onLoad = (i18n) ? views[ext].create(config, dustjs) : dustjs.onLoad;

    dustjs.onLoad = function spclOnLoad(name, options, cb) {
        var specialization = options && options.specialization;
        var mappedName = (specialization && specialization[name] || name);
        onLoad(mappedName, options, cb);
    };
};

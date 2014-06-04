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
var engine = require('adaro'),
    munger = require('./lib/munger');


exports.dust = function (setting, config) {
    var settings =  (arguments.length > 1) ? setting : {},
        configs = (arguments.length > 1) ? config : setting,
        renderer;

    if (!configs || !(configs.specialization || configs.i18n)) {
        return engine.dust(settings);
    }

    if (configs['view engine'] === 'dust') {
        munger.wrapDustOnLoad('dust', configs, settings.cache);
    }

    // Disabling cache
    // since we add our own caching layer below. (Clone it first so we don't muck with the original object.)
    settings.cache = false;

    // For i18n we silently switch to the JS engine for all requests, passing config
    renderer = configs.i18n ? engine.js(settings): engine.dust(settings);
    return munger.wrapEngine(configs, renderer);
};

exports.js = function (setting, config) {
    var settings =  (arguments.length > 1) ? setting : {},
        configs = (arguments.length > 1) ? config : setting,
        renderer;

    if (!configs || !(configs.specialization || configs.i18n)) {
        return engine.js(settings);
    }

    if (configs['view engine'] === 'js') {
        munger.wrapDustOnLoad('js', configs, settings.cache);
    }

    // Disabling cache
    // since we add our own caching layer below. (Clone it first so we don't muck with the original object.)
    settings.cache = false;
    renderer = engine.js(settings);
    return (configs.specialization) ? munger.wrapEngine(configs, renderer) : renderer;
};


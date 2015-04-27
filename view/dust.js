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

var localizr = require('localizr'),
    util = require('../lib/util'),
    dustjs = require('dustjs-linkedin'),
    path = require('path'),
    bl = require('bl'),
    VError = require('verror'),
    searchLocales = require('../lib/searchLocales.js');


//config has
//fallbackLocale
//baseTemplatePath

exports.create = function (config) {
    var i18n = config.i18n;
    return function onLoad(name, context, callback) {

        var out, options, global, locals, locality, props;

        global = context.global;
        locals = context.get('context');
        locality = util.localityFromLocals(locals);
        searchLocales(i18n.contentPath, name + '.properties', [locality, i18n.fallback], function (err, props) {
            props = props || i18n.contentPath;

            options = {
                src: path.join(config.views, name + '.dust'),
                props: props,
                enableMetadata: config.enableMetadata
            };

            out = bl(function (err, data) {
                if (err) {
                    return callback(err);
                }

                try {
                    var compiledDust = dustjs.compile(data.toString('utf-8'), name);
                    callback(null, compiledDust);
                } catch (e) {
                    callback(new VError(e, 'Problem rendering dust template named %s', name));
                }
            });

            localizr.createReadStream(options).pipe(out);
        });
    };
};



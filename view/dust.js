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

var fs = require('fs'),
    localizr = require('localizr'),
    dustjs = require('dustjs-linkedin'),
    resolver = require('fileResolver'),
    path = require('path'),
    concat = require('concat-stream');


//config has
//fallbackLocale
//baseTemplatePath

exports.create = function (config) {
    var res = resolver.create({ root: config.baseContentPath, ext: 'properties', fallback: config.fallbackLocale });
    return function onLoad(name, context, callback) {

        var out, options, global, locals, locality, props;

        global = context.global;
        locals = context.get('context');
        locality = locals && locals.locality;
        props = res.resolve(name, locality).file || config.baseContentPath;

        options = {
            src: path.join(config.baseTemplatePath, name + '.dust'),
            props: props
        };

        out = concat({ encoding: 'string' }, function (data) {
            var compiledDust;
            try {
                compiledDust = dustjs.compile(data, name);
                callback(null, compiledDust);
            } catch (e) {
                callback(e);
            }
        });

        try {
            localizr.createReadStream(options).pipe(out);
        } catch (e) {
            callback(e);
        }
    };
};


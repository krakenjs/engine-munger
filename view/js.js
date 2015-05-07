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

var fs = require('graceful-fs');
var util = require('../lib/util');
var resolver = require('file-resolver');

exports.create = function (config, dustjs) {

    var res,
        defaultLocale = config.i18n.fallback;

    res = resolver.create({ root: config.views, ext: 'js', fallback: defaultLocale });

    return function onLoad(name, options, callback) {
        var view = res.resolve(name, util.localityFromLocals(options));

        if (!view.file) {
            return callback(new Error('Could not load template ' + name));
        }

        fs.readFile(view.file, 'utf8', function (err, data) {
            if (err) {
                return callback(err);
            } else {
                var tmpl = dustjs.loadSource(data);
                return callback(null, tmpl);
            }
        });
    };

};


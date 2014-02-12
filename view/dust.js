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

var dustjs = require('dustjs-linkedin'),
    fs = require('fs'),
    localizr = require('localizr');


exports.create = function () {
    return function onLoad(name, context, callback) {

        var out, options;
        options = {
            src: path.join(__dirname, 'templates', 'index.dust'),
            props: path.join(__dirname, 'content', 'index.properties')
        };

        out = concat({ encoding: 'string' }, function(data) {
            var compiledDust;
            try {
                compiledDust = dustjs.compile(data, name);
                callback(null, compiledDust);
            } catch (e) {
                callback(e);
            }
        });

        try {
            localizr.createReadStream(options).pipe(fs.createWriteStream(out));
        } catch (e) {
            callback(e);
        }
    };
};


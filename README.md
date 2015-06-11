engine-munger
=============

A replacement Express view class that provides asynchronous resolution, allows
engines to use the lookup method to locate partials, and extends the lookup
method to be configurable based on i18n locale and a template specialization
rule map.

This is a backport of [work for Express 5](https://github.com/strongloop/express/pull/2653)

Lead Maintainer: [Aria Stewart](https://github.com/aredridel)

[![Build Status](https://travis-ci.org/krakenjs/engine-munger.svg?branch=master)](https://travis-ci.org/krakenjs/engine-munger)

What does i18n mean?
--------------------

i18n means "internationalization". Given a `locale` property in the render options, `engine-munger` will look for content in a locale-specific directory (or in a fallback locale if that is not a match) for templates and partials. This is particularly useful with template engines that pre-localize their compiled forms, such as with [`localizr`](https://github.com/krakenjs/localizr) and [`dustjs-linkedin`](http://dustjs.com/) together.

What does specialization mean?
------------------------------

Ability to switch a specific template with another based on a rule set specified in the app config. The actual rule parsing is done using the module [`karka`](https://github.com/krakenjs/karka).

All engine-munger does is includes a specialization map with the list of key value pairs using the karka module.

```javascript
{
    specialization : {
        'jekyll': [
            {
                is: 'hyde',
                when: {
                    'whoAmI': 'badGuy'
                }
            }
        ]
    }
}
```

The above will switch the template from `jekyll` to `hyde` if the render options contain `"whoAmI": "badGuy"`. Rules can be as complex as you need for your application and are particularly good for running A/B tests.

Using engine-munger in an application
=====================================

This example uses the [`adaro`](https://github.com/krakenjs/adaro) template engine, which wraps dust up as an express view engine, and uses engine-munger's more sophisticated lookup method to find partials, allowing them to be localized and specialized based on the render options.

```javascript
var munger = require('engine-munger');
var adaro = require('adaro');
var app = require('express')();

var specialization = {
    'jekyll': [
        {
            is: 'hyde',
            when: {
                'whoAmI': 'badGuy'
            }
        }
    ]
};
app.set("view", munger({
    "dust": {
        specialization: specialization
    },
    "js": {
        specialization: specialization,
        i18n: {
            fallback: 'en-US',
            contentPath: 'locales'
        }
    }
});

var engineConfig = {}; // Configuration for your view engine

app.engine('dust', adaro.dust(engineConfig));
app.engine('js', adaro.js(engineConfig));
```

Running Tests:

```shell
npm test
```

To run coverage:

```shell
npm run cover
```

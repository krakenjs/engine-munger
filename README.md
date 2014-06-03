engine-munger [![Build Status](https://travis-ci.org/paypal/kraken-js.png)](https://travis-ci.org/krakenjs/engine-munger)
=============

A template engine munging library.
It looks for appropriate template consolidation library for specified view engine and includes i18n and specialization in the workflow.

###### What does i18n mean ?
Localization of included content tags for a specified locale. Currently supported only for dust templating engine and internally uses the module [localizr](https://github.com/krakenjs/localizr) for translating content tags included in the templates

###### What does specialization mean ?
Ability to switch a specific template with another based on a rule set specified in the app config. The actual rule parsing is done using the module [karka](https://github.com/krakenjs/karka) and can be extended and used in any templating engine and not dust.
All engine-munger does is includes a specialization map with the list of key value pairs using the karka module.
```javascript
{
    _specialization : {
        ...
        originalTemplate : <mappedTemplate>
        ...
    }
}
```

##### Currently supported template engines out of the box:

* Dust: Engine types 'js' and 'dust'


Simple Usage:

```javascript
var engine-munger = require('engine-munger'),
    app = require('express')();

app.engine('dust', engine-munger['dust'](settings, config));
app.engine('js', engine-munger['js'](settings, config));
```

* settings : [JSON] Arguments you want passed to the templating engine,
* config: [JSON] used to specify whether you need i18n/specialization enabled. It also compulsarily requires the 'view' and 'view engine' settings passed into express app.

 If you are using kraken-js 1.0 along with engine-munger, the kraken generator will automatically set this all up for you.
 But if you want to use this with a stand alone express app with dust as templating engine, you can specify as follows:

 Example params:

 ```javascript
 var settings  = {cache: false},
     config = {
         'views': 'public/templates',
         'view engine': 'dust',
         'i18n': {
             'fallback': 'en-US',
             'contentPath': 'locales'
         },
         specialization: {
             'jekyll': [
                 {
                     is: 'hyde',
                     when: {
                         'whoAmI': 'badGuy'
                     }
                 }
             ]

         }
     };
 ```

Running Tests:

```
To run tests:
$ npm test

To run coverage
$ npm run-script cover

To run lint
$ npm run-script lint
```



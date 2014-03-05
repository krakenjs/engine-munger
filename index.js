'use strict';
var views = require('./view'),
    util = require('./lib/util'),
    engine = require('adaro'),
    dustjs = require('dustjs-linkedin'),
    cache = require('./lib/cache'),
    fs = require('fs'),
    path = require('path');

console.info('engine', engine);
//wrapEngine helps populate the context
//with the specialization map before
//dust.load is called
//this helps load the right specialized templates
//down the render work flow

function wrapEngine(config, engine) {
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
}

//wrapDustOnLoad makes sure every dust partial that is loaded
// has the right specialization/localization applied on it

function wrapDustOnLoad(app, ext, i18n) {
    console.info('calle dinto dust onload');
    var specialization,
        mappedName,
        config = {},
        viewCache;
    if (i18n) {
        config.fallbackLocale = i18n.fallback || i18n.fallbackLocale;
        config.baseContentPath = i18n.contentPath;
        config.ext = ext;
        config.baseTemplatePath = app.get('views');
    }

    var onLoad = (i18n) ? views[ext].create(app, config) : function load(name, context, cb) {
        var views, file;

        views = app.get('views');
        file = path.join(views, name + '.' + ext);
        fs.readFile(file, 'utf8', function (err, data) {
            cb.apply(undefined, arguments);
        });
    };
    //custom cache for all specialized or localized templates
    viewCache = cache.create(onLoad, config.fallbackLocale);
    onLoad = viewCache.get.bind(viewCache);
    dustjs.onLoad = function (name, context, cb) {
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

    dustjs.poornima = 'iam here';
    console.info('setting dustjs.onload', dustjs.onLoad);
}

exports.dust = function (app, config, renderer) {
    var current, settings;

    if (!config.specialization && !config.i18n) {
        return renderer;
    }

    wrapDustOnLoad(app, 'dust', config.i18n);

    // Disabling cache
    // since we add our own caching layer below. (Clone it first so we don't muck with the original object.)
    current = app.engines['.dust'];
    settings = (current && current.settings) || {};
    settings.cache = false;
    // For i18n we silently switch to the JS engine for all requests, passing config
    renderer = config.i18n ? engine.js(settings): renderer;

    return wrapEngine(config, renderer);
};

exports.js = function (app, config, renderer) {
    console.info('calle dinto engone munger js');
    if (config.specialization || config.i18n) {
        wrapDustOnLoad(app, 'js', config.i18n);
    }
    return (config.specialization) ? wrapEngine(config, renderer) : renderer;
};


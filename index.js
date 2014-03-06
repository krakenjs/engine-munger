'use strict';
var views = require('./view'),
    util = require('./lib/util'),
    dustjs = require('dustjs-linkedin'),
    engine = require('adaro'),
    cache = require('./lib/cache'),
    fs = require('fs'),
    path = require('path');


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

function wrapDustOnLoad(ext, config) {
    var specialization,
        mappedName,
        conf = {},
        viewCache,
        i18n = config.i18n;
    if (config.i18n) {
        conf.fallbackLocale = i18n.fallback || i18n.fallbackLocale;
        conf.baseContentPath = i18n.contentPath;
        conf.ext = ext;
        conf.baseTemplatePath = config.views;
    }

    var onLoad = (i18n) ? views[ext].create(config) : function load(name, context, cb) {
        var views, file;

        views = config.views;
        file = path.join(views, name + '.' + ext);
        fs.readFile(file, 'utf8', function (err, data) {
            cb.apply(undefined, arguments);
        });
    };
    //custom cache for all specialized or localized templates
    viewCache = cache.create(onLoad, i18n ? i18n.fallbackLocale : '*');
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
}

exports.dust = function (config) {
    var current,
        settings =  config.settings || {},
        renderer;
    if (!(config.specialization || config.i18n)) {
        return engine.dust(settings);
    }

    wrapDustOnLoad('dust', config);

    // Disabling cache
    // since we add our own caching layer below. (Clone it first so we don't muck with the original object.)

    settings.cache = false;
    // For i18n we silently switch to the JS engine for all requests, passing config
    renderer = config.i18n ? engine.js(settings): engine.dust(settings);

    return wrapEngine(config, renderer);
};

exports.js = function (config) {
    var renderer = engine.js(config.settings || {});
    var engine = (config.specialization) ? wrapEngine(config, renderer) : renderer;
    if (config.specialization || config.i18n) {
        wrapDustOnLoad('js', config);
    }
    return engine;
};


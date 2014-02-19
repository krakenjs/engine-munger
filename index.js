'use strict';
var views = require('./view'),
    util = require('./lib/util'),
    dustjs = require('dustjs-linkedin'),
    engine = require('adaro'),
    cache = require('./lib/cache');

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
        return function(file, options, callback) {
            //generate the specialization map
            options._specialization =  spclizr && spclizr.resolveAll(options);
            engine.apply(null, arguments);
        };
    }
}

//wrapDustOnLoad makes sure every dust partial that is loaded
// has the right specialization/localization applied on it

function wrapDustOnLoad(app, ext, i18n) {
    var specialization,
        mappedName,
        config = {},
        viewCache;
    if (i18n) {
        config.fallbackLocale = i18n.fallback || i18n.fallbackLocale;
        config.baseContentPath = i18n.contentPath;
    }
    config.ext = ext;
    config.baseTemplatePath = app.get('views');

    var onLoad = (i18n) ? views[ext].create(app, config) : dustjs.onLoad;
    //custom cache for all specialized or localized templates
    viewCache = cache.create(onLoad, config.fallbackLocale);
    onLoad = viewCache.get.bind(viewCache);
    dustjs.onLoad = function (name, context, cb) {
        specialization = (typeof context.get === 'function' && context.get('_specialization')) || context._specialization;
        mappedName = (specialization && specialization[name] || name);
        onLoad(mappedName, context, function(err, data) {
            if (!err && mappedName !== name && typeof data === 'string') {
                //this is a workaround, since adaro is not aware of the mapped name up the chain
                //we find the dust.register line and replace the mappedName of template with original name
                data = data.replace(mappedName, name);
            }
            cb(null, data);
        });
    };
}

exports.dust = function(app, config, renderer) {
    var current, settings;

    if(!config.specialization && !config.i18n) {
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

exports.js = function(app, config, renderer) {

    var engine = (config.specialization) ? wrapEngine(config, renderer) : renderer;
    if(config.specialization || config.i18n){
        wrapDustOnLoad(app, 'js', config.i18n);
    }
    return engine;
};


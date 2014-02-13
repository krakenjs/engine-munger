'use strict';
var views = require('./view'),
    util = require('./lib/util'),
    dustjs = require('dustjs-linkedin'),
    engine = require('adaro');


function wrapEngine(config, engine) {
    var spclizr, module;
    if (config.specialization) {
        module = util.tryRequire('karka');
        spclizr = module && module.create(config.specialization);
        return function(file, options, callback) {
            //generate the specialization map

            options._specialization =  spclizr && spclizr.specializer.resolveAll(options);
            engine.apply(null, arguments);
        };
    } else {
        return engine;
    }
}

function wrapDustOnLoad(app, ext, i18n) {
    var specialization,
        mappedName,
        config = {};
    if (i18n) {
        config.fallbackLocale = i18n.fallback || i18n.fallbackLocale;
    }
    config.ext = ext;
    config.baseTemplatePath = app.get('views');

    var onLoad = (i18n) ? views[ext].create(app, config) : dustjs.onLoad;
    dustjs.onLoad = function (name, context, cb) {
        specialization = (typeof context.get === 'function' && context.get('_specialization')) || context._specialization;
        mappedName = (specialization && specialization[name] || name);
        onLoad(mappedName, context, function(err, data) {
            if (!err && mappedName !== name && typeof data === 'string') {
                //this is a workaround, since adaro is not aware of the mapped name up the chain
                //we find the dust.register line and replace the mappedName of template with original name
                data = data.replace(mappedName, name);
            }
            cb(err, data);
        });
    }
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
    renderer = config.i18n ? engine.js(settings): engine.dust(settings);

    console.info('***** renderer:' + renderer);

    return wrapEngine(config, renderer);
};

exports.js = function(app, config, renderer) {
    if(config.specialization || config.i18n){
        wrapDustOnLoad(app, 'js',config.i18n);
    }
    return wrapEngine(config, renderer);
};


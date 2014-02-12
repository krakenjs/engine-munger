'use strict';
var views = require('./view'),
    util = require('./lib/util'),
    dustjs = require('dustjs-linkedin');


function wrapEngine(config, engine) {
    var spclizr, module;
    if (config.specialization) {
        module = util.tryRequire('karka');
        spclizr = module && module.create(config);
    }
    return function(file, options, callback) {
        //generate the specialization map
        options._specialization =  spclizr && spclizr.resolveAll(options);
        engine.apply(null, arguments);
    };
}

function wrapDustOnLoad(app, ext, i18n) {
    var specialization,
        mappedName,
        fallbackLocale;
    if (i18n) {
        fallbackLocale = i18n.fallback || i18n.fallbackLocale;
    }

    var onLoad = views[ext].create(app, fallbackLocale);

    dustjs.onLoad = function onLoad (name, context, cb) {
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
    var ext = (config.i18n && app.get('view engine') === 'dust')? 'js': ext;
    wrapDustOnLoad(app, ext, config.i18n);
    return wrapEngine(config, renderer);
};

exports.js = function(app, config, renderer) {
    wrapDustOnLoad(app, 'js',config.i18n);
    return wrapEngine(config, renderer);
};


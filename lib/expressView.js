var resolver = require('file-resolver');

var proto = {

    get path() {
        // Unfortunately, since we don't know the actual file to resolve until
        // we get request context (in `render`), we can't say whether it exists or not.
        return true;
    },

    render: function (options, callback) {
        var locals, view, engine;

        locals = options && options.context;
        view = this.resolver.resolve(this.name, locals && locals.locality);

        // This is a bit of a hack to ensure we override `views` for the duration
        // of the rendering lifecycle. Unfortunately, `adaro` and `consolidate`
        // (https://github.com/visionmedia/consolidate.js/blob/407266806f3a713240db2285527de934be7a8019/lib/consolidate.js#L214)
        // check `options.views` but override with `options.settings.views` if available.
        // So, for this rendering task we need to override with the more specific root directory.
        options.settings = Object.create(options.settings);
        options.views = options.settings.views = view.root;

        engine = this.engines['.' + this.defaultEngine];
        engine(view.file, options, callback);
    }

};


function buildCtor(fallback) {

    function View(name, options) {
        this.name = name;
        this.root = options.root;
        this.defaultEngine = options.defaultEngine;
        this.engines = options.engines;
        this.resolver = resolver.create({ root: options.root, ext: this.defaultEngine, fallback: fallback });
    }

    View.prototype = proto;
    return View;
}

module.exports = function () {

    return function(req, res, next) {
        var res,
            config = req.app.kraken;

        if (config.get('express:view engine') === 'js') {
            req.app.set('view', buildCtor(config.get('i18n:fallback')));
        }
        next();
    }
};




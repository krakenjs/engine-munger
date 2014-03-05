'use strict';

module.exports = function (dustjs) {
    function onLoad (name, context, cb) {
        cb(null, 'success');
    }
    var renderer = function() {
        return function (file, options, callback) {

            console.info('*****checking in here', dustjs.poornima);
            if (dustjs.onLoad) {
                console.info('****** onLoad is defined');
                dustjs.onLoad(file, options, callback);
            } else {
                onLoad(file, options, callback);
            }
        };
    };
    return {
        onLoad: onLoad,
        js: renderer,
        dust: renderer
    };
};

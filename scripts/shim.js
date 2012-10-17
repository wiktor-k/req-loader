/**
 * Loads libraries not prepared for AMD by capturing variable attached to window.
 * For example dependency: "shim!underscore.js:_" loads underscore.js file
 * and captures variable "_" as module definition.
 */
define('shim', [], function() {
    return {
        load: function (name, parentRequire, load, config) {
            var path = name.substring(0, name.indexOf(':'));
            var symbol = name.substring(name.indexOf(':') + 1);
            var node = document.createElement('script');
            node.type = 'text/javascript';
            node.charset = 'utf-8';
            node.async = true;
            node.src = path;
            node.addEventListener('load', function() {
                var plugin = window[symbol];
                delete window[symbol];
                load(plugin);
            }, false);
            node.addEventListener('error', load.error, false);
            document.head.appendChild(node);
        },
        normalize: function(name, normalize) {
            return normalize(name.substring(name.indexOf('!') + 1));
        }
    };
});

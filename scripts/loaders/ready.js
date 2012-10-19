/**
 * Notifies dependencies when DOM is loaded for example: "ready!".
 */
define('../loaders/ready', [], function() {
    return {
        load: function(name, parentRequire, load, config) {
            if (document.readyState === "complete") {
              load("instant");
            } else {
              window.addEventListener("load", load.bind(null, "delayed"), false);
            }
        },
        normalize: function() {
        }
    };
});

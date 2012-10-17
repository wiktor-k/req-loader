/**
 * Loads resource as string for example: "text!file.txt".
 */
define('text', [], function() {
    return {
        load: function(name, parentRequire, load, config) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        load(xhr.responseText);
                    } else {
                        load.error(xhr.status);
                    }
                }
            };
            xhr.onerror = load.error;
            xhr.open("GET", name, true);
            xhr.send(null);
        },
        normalize: function(name, normalize) {
            return normalize(name.substring(name.indexOf('!') + 1));
        }
    };
});

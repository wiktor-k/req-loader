Simple require.js-like asynchronous depedency loader
====================================================

See scripts/lib/req.js for the loader's code.

Sample code that uses the loader:

    define('models/rect', ['models/point'], function(Point) {

        console.log("=====> Loading Rect");

        function Rect(topLeft, bottomRight) {
            this.topLeft = topLeft;
            this.bottomRight = bottomRight;
        }

        Rect.prototype.area = function() {
            var x = this.topLeft.x - this.bottomRight.x;
            var y = this.topLeft.y - this.bottomRight.y;
            return text + (x * y);
        };

        return Rect;
    });

See scripts/app/main.js for more advanced example:


    define('main', // module name
            ['models/rect', 'models/point', // ordered array of dependency names
            '../loaders/shim!lib/underscore.js:_', // using loader plugins
            '../loaders/ready!'], function(Rect, Point, _) {

        console.log("=====> Loading Main");

        var r = new Rect(new Point(1, 1), new Point(20, 20));
        var a = r.area();
        document.body.textContent = "" + a + ": " + _.uniq([1, 2, 1, 3, 1, 4]).join(", ");

        return {};
    });

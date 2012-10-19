define('main', ['models/rect', 'models/point', '../loaders/shim!lib/underscore.js:_', '../loaders/ready!'], function(Rect, Point, _) {
    console.log("=====> Loading Main");

    var r = new Rect(new Point(1, 1), new Point(20, 20));
    var a = r.area();
    document.body.textContent = "" + a + ": " + _.uniq([1, 2, 1, 3, 1, 4]).join(", ");

    return {};
});

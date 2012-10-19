define('models/point', ['../loaders/text!file.txt'], function(text) {
    console.log("=====> Loading Point");
    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.name = text;
    }

    return Point;
});

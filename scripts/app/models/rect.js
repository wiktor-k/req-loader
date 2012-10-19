define('models/rect', ['models/point', '../loaders/text!file.txt'], function(Point, text) {
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

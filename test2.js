const opencv = require('opencv');
const robot = require('robotjs');

const fs = require("fs");

console.log('Run');
var stream_wnd = new opencv.NamedWindow('Video', 0);
console.log(stream_wnd);

var process = robot.Process.getList("RuneScape.exe")[0],
    stream_wnd = new opencv.NamedWindow('Video', 0),
    target_wnd = process.getWindows()[0],
    _image = robot.Image(),
    _bounds = target_wnd.getBounds();


while (true) {
    robot.Screen.grabScreen(_image, 0, 0, _bounds.w, _bounds.h,
        process.getWindows()[0]);

    stream_wnd.show(img2mat(_image, _bounds.h, _bounds.w));

    stream_wnd.blockingWaitKey(1);
}

// imaget to matrix
function img2mat(img, size_x, size_y) {
    var _buffer = Buffer(size_x * size_y),
        _data = img.getData(),
        _matrix = new opencv.Matrix(size_x, size_y, opencv.Constants.CV_8UC1);

    for (let index = 0; index < size_x * size_y; index++) {
        _buffer[index] = _data[index];
    }
    _matrix.put(_buffer);
    return _matrix;
}
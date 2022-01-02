//const cv = require('C:/Users/Howard/AppData/Roaming/npm/node_modules/opencv4nodejs');
const cv = require('opencv4nodejs');
const robot = require('robotjs');
const ffi = require('ffi');
//const _robot = require('robot-js');
const SRCCOPY = 13369376	// dest = source

function TEXT(text) {
    return Buffer.from(`${text}\0`, "ucs2");
}

const user32 = new ffi.Library('user32', {
    // Find Window via string name
    FindWindowW: ['int32', ['string', 'string']],

    // Get Window Rectangles Positions
    GetWindowRect: ['bool', ['int32', 'pointer']],

    // Pop Up
    SetForegroundWindow: ['bool', ['int32']],

    // Device Context
    GetDC: ['pointer', ['int32']],
});

const gdi32 = new ffi.Library('gdi32', {
    // Create memory device context compatible with the specified device
    CreateCompatibleDC: ['pointer', ['int32']],

    //
    CreateCompatibleBitmap: ['pointer', ['pointer', 'int32', 'int32']],

    //
    SelectObject: ['pointer', ['pointer', 'pointer']],

    //
    BitBlt: ['bool', ['pointer', 'int32', 'int32', 'int32', 'int32', 'pointer', 'int32', 'int32', 'int32']],

    //
    GetPixel: ['pointer', ['pointer', 'int32', 'int32']],

    //
    GetDIBits: ['pointer', ['int32', 'int32', 'int32', 'int32', 'int32', 'int32', 'int32']],
});


const SCREEN_RESOLUTION_Y = 1920;
const SCREEN_RESOLUTION_X = 1080;

///
class WindowCapture {
    constructor(windowName = null) {
        this.width = 2560;
        this.height = 1440;
        this.hwnd = null;
        this.windowname = windowName;

        if (this.windowname == null) {
            throw 'Window name needed';
        } else {
            const GetWindowPosition = function (handle) {
                var rectPointer = Buffer.alloc(4 * 4);
                var success = user32.GetWindowRect(handle, rectPointer);
                if (!success) return null;

                let rect = RectPointerToRect(rectPointer);
                return rect;
            };

            const RectPointerToRect = function (rectPointer) {
                let rect = {};
                rect.left = rectPointer.readUInt32LE(0);
                rect.top = rectPointer.readUInt32LE(4);
                rect.right = rectPointer.readUInt32LE(8);
                rect.bottom = rectPointer.readUInt32LE(12);
                return rect;
            };
            //this.hwnd = user32.FindWindowW(null, this.windowname);
            this.hwnd = user32.FindWindowW(null, TEXT(this.windowname));
            user32.SetForegroundWindow(this.hwnd); // Pop up
            this.window_rect = GetWindowPosition(this.hwnd);

            //this.window_rect = RectPointerToRect(this.hwnd);

            //this.window_rect = user32.GetWindowRect(this.hwnd);
            //console.log('this.sdsadas,', this.hwnd, this.window_rect);
            this.width = this.window_rect[2] - this.window_rect[0];
            this.height = this.window_rect[3] - this.window_rect[1];

            if (!(this.hwnd)) {
                throw `Window not found ${this.windowname}`;
            }
        }
    }

    window_capture() {
        let wDC = user32.GetDC(this.hwnd);
        //console.log('wDC', wDC);

        

        let cDC = gdi32.CreateCompatibleDC(wDC);
        console.log('cDC', cDC);


        let bmpTarget = gdi32.CreateCompatibleBitmap(cDC, this.width, this.height);
        // console.log('dataBitMap', bmpTarget);

        // let oldBmp = gdi32.SelectObject(cDC, bmpTarget);
        // console.log('oldBmp', oldBmp);

        let x = gdi32.BitBlt(cDC, 0, 0, this.width, this.height, wDC, 0, 0, SRCCOPY);
        console.log('x', x);

        // bmpTarget = gdi32.SelectObject(cDC, oldBmp);


        let y = gdi32.GetDIBits(wDC, bmpTarget, 0 , 1, 0, 0, 0);
        console.log('y', y);


        console.log('bmpTarget', bmpTarget);
        const buffer = Buffer.from(bmpTarget);
        //console.log('bmpTarget', buffer);
        return buffer;
        // const pixelWnd = gdi32.GetPixel(wDC, 0, 0);
        // const pixelMem = gdi32.GetPixel(cDC, 0, 0);

        // console.log('pixelWnd', pixelWnd);
        // console.log('pixelMem', pixelMem);



        // Bit block transfer into our compatible memory DC.
        // const bitBltRes = gdi32.BitBlt(hdcMemDC, 0, 0, rcClient.right - rcClient.left, rcClient.bottom - rcClient.top, hdcWindow, 0, 0, apiConstants.SRCCOPY);
        // const pixelWnd = gdi32.GetPixel(hdcWindow, 0, 0);
        // const pixelMem = gdi32.GetPixel(hdcMemDC, 0, 0);

    }
}


var wc = new WindowCapture('RuneScape');

function img2mat(img, width, height) {
    return new cv.Mat(img, height, width, cv.CV_8UC4)
}

while (true) {
    // var img = robot.screen.capture(0, 0, SCREEN_RESOLUTION_Y, SCREEN_RESOLUTION_X);
    // console.log('img: ', img);
    // var img = img.image;

    var img = wc.window_capture();
    console.log('img: ', img);



    //console.log(img);
    //var x = wc.window_capture();
    var img = img2mat(img, SCREEN_RESOLUTION_Y, SCREEN_RESOLUTION_X)

    //var img1 = new cv.Mat('asd', SCREEN_RESOLUTION_Y, SCREEN_RESOLUTION_X, cv.CV_8UC4)

    cv.imshow('output', img);



    let key = cv.waitKey(1);

    if (key == ord('q')) {
        break;
    }
}




function ord(str) { return str.charCodeAt(0); }





// const cv = require('opencv4nodejs')
// const robot = require('robotjs')

// function img2mat (img, width, height) {
//   return new cv.Mat(img, height, width, cv.CV_8UC4)
// }

// function screen2mat () {
//   let cap = robot.screen.capture(0, 0, 1920, 1080)
//   let mat = img2mat(cap.image, 1920, 1080)
//   return mat
// }

// console.log(screen2mat());
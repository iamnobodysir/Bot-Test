const cv = require('opencv4nodejs');
const robot = require('robotjs');
const crypto = require('crypto');
const dateFormat = require('dateformat');
const _ = require('lodash');

const _a = BigInt(25096281518912105342191851917838718629n);
const _m = BigInt(2n ** 128n);

const SCREEN_RESOLUTION_Y = 2560;
const SCREEN_RESOLUTION_X = 1440;

const WANTED_POSITION = {
    x_min: 2089,
    x_max: 2107,
    y_min: 1131,
    y_max: 1149
};

const EMPTY_INVENTORY_COLOR = [
    "0c1d26",
    "0c1e28",
    "0d212d",
    "0d1f29",
    "061820",
    "081a24",
    "0d1e26",
    "0f222c",
    "0b1d27",
    "11252e",
    "0b1c24",
    "102129",
    "091d27",
    "0a1c26",
    "071821",
    "081920",
    "0d232d",
    "091e29",
    "122832",
    "0b1b23",
    "11232b",
    "071923",
    "0a1a22",
    "162a34",
];

function main() {
    console.log('Program Starting...');

    try {
        msleep(5000);
        //getPixelColor(null, null, true);

        let previous_xPosition = null;
        let previous_yPosition = null;
        let restFor = rand_range(30000, 420000 + 1);
        let startTime = Date.now();
        let startDate = dateFormat(startTime);
        console.log('Rest for (minutes): ', restFor / 60000);

        //while (Date.now() - startTime < restAt) {
        while (true) {
            console.log('A loop start.');

            if (!(Date.now() - startTime < restFor)) {
                let randTime = rand_range(0, 294000 + 1);
                console.log('To pause for (minutes): ', randTime / 60000)

                msleep(randTime);
                restFor = rand_range(30000, 420000 + 1);
                startTime = Date.now();
                console.log('Start time: ', dateFormat(startTime));
                console.log('Rest for (minutes): ', restFor / 60000);
            }

            let xPosition = rand_range(WANTED_POSITION.x_min, WANTED_POSITION.x_max + 1);
            let yPosition = rand_range(WANTED_POSITION.y_min, WANTED_POSITION.y_max + 1);

            // Guessing...
            if (rand_range(0, 1 + 1) === 1 && (previous_xPosition != null && previous_yPosition != null)) {
                xPosition = previous_xPosition;
                yPosition = previous_yPosition;
            }

            msleep(rand_range(0, 3000 + 1));

            console.log('Moving to X coordinate:', xPosition, ' and Y coordinate: ', yPosition);
            robot.moveMouseSmooth(xPosition, yPosition);

            robot.keyTap('numpad_2');

            msleep(rand_range(0, 2000 + 1));
            robot.mouseClick();

            if (_.includes(EMPTY_INVENTORY_COLOR, getPixelColor(xPosition, yPosition))) {
                console.table(EMPTY_INVENTORY_COLOR);
                break;
            }

            previous_xPosition = xPosition;
            previous_yPosition = yPosition;
        }

        console.table({
            started: startDate,
            ended: dateFormat(Date.now())
        });

        return 0;
    } catch (error) {
        console.error(error);
    }
}

if (require.main === module) {
    console.log(main());
}

function msleep(millisec) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, millisec);
}

function getPixelColor(x, y, getListColor = false) {
    var img = robot.screen.capture(0, 0, SCREEN_RESOLUTION_Y, SCREEN_RESOLUTION_X);
    var pixel_color = null;
    if (getListColor) {
        var x_diff = WANTED_POSITION.x_max - WANTED_POSITION.x_min
        var y_diff = WANTED_POSITION.y_max - WANTED_POSITION.y_min;

        var start_x_position = WANTED_POSITION.x_min;
        for (var _x = 0; _x < x_diff; _x++) { // X coordinate            
            var start_y_position = WANTED_POSITION.y_min;
            for (var _y = 0; _y < y_diff; _y++) { // Y coordinate
                pixel_color = img.colorAt(start_x_position, start_y_position);

                if (!(_.includes(EMPTY_INVENTORY_COLOR, pixel_color))) { // Don't have then push
                    EMPTY_INVENTORY_COLOR.push(pixel_color);
                }

                start_y_position++;
            }
            start_x_position++;
        }

        return true;
    } else {
        pixel_color = img.colorAt(x, y);
        console.log('pixel_color: ', pixel_color);
        return pixel_color;
    }

}

function rand_range(min, max) { //inclusive of min, exclusive of max
    min = BigInt(min || 0n);
    max = BigInt(max || 0n);
    var randomCrypto = parseInt(crypto.randomBytes(10).toString('hex'), 16);
    var seed = BigInt(randomCrypto);
    seed = seed * _a % _m;
    var diff = max - min;
    var rnd = Number(seed * 1000000000000000n / _m * diff) / 1000000000000000;

    return Number(min + BigInt(Math.floor(rnd)));
}
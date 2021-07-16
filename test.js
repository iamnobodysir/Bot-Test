const cv = require('opencv4nodejs');

const path_haystack_image = './Image/runescapeSample.jpg';
const path_needle_image = './Image/runescapeBanker.jpg';

let haystack_image = cv.imread(path_haystack_image, cv.IMREAD_REDUCED_COLOR_2);
let needle_image = cv.imread(path_needle_image, cv.IMREAD_REDUCED_COLOR_2);

console.log('needle_image', needle_image);
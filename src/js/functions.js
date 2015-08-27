/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

/**
 * Parse an int to a more readable string
 *
 * @param int duration
 * @return string
 */
var parseDuration = function (duration) {
    var min = parseInt(duration / 60); // If the output has miliseconds, it does not matter, modulo is not important
    var sec = duration - 60 * min;

    sec = parseInt(sec);
    if(sec < 10) sec = ('0' + sec).slice(-2);

    return min + ':' + sec;
};



/**
 * Sort an array of int by ASC or DESC
 *
 * @param array  array of int to be sorted
 * @param string 'asc' or 'desc' depending of the sort needed
 * @return array
 */

var simpleSort = function(array, sorting) {

    if(sorting == 'asc') {
        array.sort(function(a, b) {
            return a - b;
        });
    }
    else if (sorting == 'desc') {
        array.sort(function(a, b) {
            return b - a;
        });
    }

    return array;
};

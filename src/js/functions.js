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
 * Sort an array of int by ASC or DESC, then remove all duplicates
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

    var result = [];
    array.forEach(function(item) {
        if(result.indexOf(item) < 0) {
            result.push(item);
        }
    });

    return result;
};



/**
 * Suffle an array with the Fisher–Yates Shuffle algorythm (http://bost.ocks.org/mike/shuffle/)
 *
 * @param array the array to be shuffled
 * @return array
 */
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

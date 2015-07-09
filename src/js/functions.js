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
    var min = parseInt(duration / 60);
    var sec = duration - 60 * min;

    if(sec < 10) sec = ('0' + sec).slice(-2)

    return min + ':' + sec;
};

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

export default {
    /**
     * Parse an int to a more readable string
     *
     * @param int duration
     * @return string
     */
    parseDuration: function (duration) {

        var hours   = parseInt(duration / 3600) % 24;
        var minutes = parseInt(duration / 60) % 60;
        var seconds = parseInt(duration % 60);

        hours = hours < 10 ? "0" + hours : hours;
        var result = hours > 0 ? hours + ':' : '';
            result += (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

        return result;
    },



    /**
     * Sort an array of int by ASC or DESC, then remove all duplicates
     *
     * @param array  array of int to be sorted
     * @param string 'asc' or 'desc' depending of the sort needed
     * @return array
     */

    simpleSort: function(array, sorting) {

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
    }
}

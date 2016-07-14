/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

import path from 'path';
import fs   from 'fs';

import mmd     from 'musicmetadata';
import wavInfo from 'wav-file-info';



let utils = {

    /**
     * Parse an int to a more readable string
     *
     * @param int duration
     * @return string
     */
    parseDuration: function (duration) {

        if(duration !== null && duration !== undefined) {

            let hours   = parseInt(duration / 3600);
            let minutes = parseInt(duration / 60) % 60;
            let seconds = parseInt(duration % 60);

            hours = hours < 10 ? '0' + hours : hours;
            let result = hours > 0 ? hours + ':' : '';
                result += (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds  < 10 ? '0' + seconds : seconds);

            return result;

        } else {
            return '00:00';
        }
    },

    /**
     * Format a list of tracks to a nice status
     *
     * @param array tracks
     * @return string
     */
    getStatus: function(tracks) {
        return tracks.length + ' tracks, ' + this.parseDuration(tracks.length === 0 ? 0 : tracks.map(d => d.duration).reduce((a, b) => a + b));
    },

    /**
     * Parse an URI, encoding some caracters
     *
     * @param string uri
     * @return string
     */
    parseURI: function(uri) {
        let root = process.platform === 'win32' ? '' : path.parse(uri).root;
        return 'file://' + root + uri.split(path.sep).map((d, i) => i === 0 ? d : encodeURIComponent(d)).reduce((a, b) => path.join(a, b));
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

        let result = [];
        array.forEach(function(item) { // TODO
            if(!result.includes(item)) {
                result.push(item);
            }
        });

        return result;
    },

    /**
     * Strip accent from String. From https://jsperf.com/strip-accents
     *
     * @param String str
     * @return String
     */
    stripAccents(str) {

        let accents = 'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿñ',
            fixes = 'aaaaaaceeeeiiiiooooouuuuyaaaaaaceeeeiiiioooooouuuuyyn',
            reg = new RegExp('(' + accents.split('').join('|') + ')', 'g');

        function replacement(a){
            return fixes[accents.indexOf(a)] || '';
        }

        return str.replace(reg, replacement).toLowerCase();
    },

    /**
     * Remove duplicates (realpath) and useless children folders
     *
     * @param array the array of folders path
     * @return array
     */
    removeUselessFolders: function(folders) {

        // Remove duplicates
        let filteredFolders = folders.filter((elem, index) => {
            return folders.indexOf(elem) === index;
        });

        let foldersToBeRemoved = [];

        filteredFolders.forEach((folder, i) => {
            filteredFolders.forEach((subfolder, j) => {
                if(subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) foldersToBeRemoved.push(subfolder);
            });
        });

        filteredFolders = filteredFolders.filter((elem, index) => {
            return !foldersToBeRemoved.includes(elem);
        });

        return filteredFolders;
    },

    /**
     * Cut an array in smaller chunks
     *
     * @param array the array to be chunked
     * @param int the length of each chunk
     * @return array
     */
    chunkArray: function(array, chunkLength) {

        let chunks = [];

        for(let i = 0, length = array.length; i < length; i += chunkLength) {
            chunks.push(array.slice(i, i+chunkLength));
        }

        return chunks;
    },

    /**
     * Get a file metadata
     *
     * @param track (object) { path, mime }
     * @return object
     *
     */
    getMetadata: function(track, callback) {

        /* output should be something like this:
            {
                album        : null,
                albumartist  : null,
                artist       : null,
                disk         : null,
                duration     : null,
                genre        : null,
                loweredMetas : null,
                path         : null,
                playCount    : null,
                title        : null,
                track        : null,
                type         : null,
                year         : null
            }
        */

        if(['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/x-pn-wav'].includes(track.mime)) { // If WAV

            wavInfo.infoByFilename(track.path, function(err, info){

                if (err) console.warn(err);

                let metadata = {
                   album        : 'Unknown',
                   albumartist  : [],
                   artist       : ['Unknown artist'],
                   disk         : {
                       no: 0,
                       of: 0
                   },
                   duration     : info.duration,
                   genre        : [],
                   loweredMetas : {},
                   path         : track.path,
                   playCount    : 0,
                   title        : path.parse(track.path).base,
                   track        : {
                       no: 0,
                       of: 0
                   },
                   type         : 'track',
                   year         : ''
               };

               metadata.loweredMetas = {
                   artist      : metadata.artist.map(meta => utils.stripAccents(meta.toLowerCase())),
                   album       : utils.stripAccents(metadata.album.toLowerCase()),
                   albumartist : metadata.albumartist.map(meta => utils.stripAccents(meta.toLowerCase())),
                   title       : utils.stripAccents(metadata.title.toLowerCase()),
                   genre       : metadata.genre.map(meta => utils.stripAccents(meta.toLowerCase()))
               }

                callback(metadata);
            });

        } else {

            let stream = fs.createReadStream(track.path);

            mmd(stream, { duration: true }, function (err, data) {

                if(err) console.warn('An error occured while reading ' + track.path + ' id3 tags: ' + err);

                let metadata = {
                   album        : data.album === null || data.album === '' ? 'Unknown' : data.album,
                   albumartist  : data.albumartist,
                   artist       : data.artist.length === 0 ? ['Unknown artist'] : data.artist,
                   disk         : data.disk,
                   duration     : data.duration == '' ? 0 : data.duration,
                   genre        : data.genre,
                   loweredMetas : {},
                   path         : track.path,
                   playCount    : 0,
                   title        : data.title === null || data.title === '' ? path.parse(track.path).base : data.title,
                   track        : data.track,
                   type         : 'track',
                   year         : data.year
               };

                metadata.loweredMetas = {
                    artist      : metadata.artist.map(meta => utils.stripAccents(meta.toLowerCase())),
                    album       : utils.stripAccents(metadata.album.toLowerCase()),
                    albumartist : metadata.albumartist.map(meta => utils.stripAccents(meta.toLowerCase())),
                    title       : utils.stripAccents(metadata.title.toLowerCase()),
                    genre       : metadata.genre.map(meta => utils.stripAccents(meta.toLowerCase()))
                };

                callback(metadata);
            });
        }
    }
}

export default utils;

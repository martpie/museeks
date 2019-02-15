"use strict";
/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var util = require("util");
var globby = require("globby");
var mmd = require("music-metadata");
var pickBy_1 = require("lodash-es/pickBy");
var stat = util.promisify(fs.stat);
/**
 * Parse an int to a more readable string
 */
exports.parseDuration = function (duration) {
    if (duration !== null) {
        var hours = Math.trunc(duration / 3600);
        var minutes = Math.trunc(duration / 60) % 60;
        var seconds = Math.trunc(duration) % 60;
        var hoursStringified = hours < 10 ? "0" + hours : hours;
        var minutesStringified = minutes < 10 ? "0" + minutes : minutes;
        var secondsStringified = seconds < 10 ? "0" + seconds : seconds;
        var result = hoursStringified > 0 ? hoursStringified + ":" : '';
        result += minutesStringified + ":" + secondsStringified;
        return result;
    }
    return '00:00';
};
/**
 * Parse an URI, encoding some characters
 */
exports.parseUri = function (uri) {
    var root = process.platform === 'win32' ? '' : path.parse(uri).root;
    var location = uri
        .split(path.sep)
        .map(function (d, i) { return (i === 0 ? d : encodeURIComponent(d)); })
        .reduce(function (a, b) { return path.join(a, b); });
    return "file://" + root + location;
};
/**
 * Parse data to be used by img/background-image with base64
 */
exports.parseBase64 = function (format, data) {
    return "data:image/" + format + ";base64," + data;
};
/**
 * Sort an array of string by ASC or DESC, then remove all duplicates
 */
exports.simpleSort = function (array, sorting) {
    if (sorting === 'asc') {
        array.sort(function (a, b) { return a > b ? 1 : -1; });
    }
    else if (sorting === 'desc') {
        array.sort(function (a, b) { return b > a ? -1 : 1; });
    }
    var result = [];
    array.forEach(function (item) {
        if (!result.includes(item))
            result.push(item);
    });
    return result;
};
/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 */
exports.stripAccents = function (str) {
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var fixes = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
    var split = accents.split('').join('|');
    var reg = new RegExp("(" + split + ")", 'g');
    function replacement(a) {
        return fixes[accents.indexOf(a)] || '';
    }
    return str.replace(reg, replacement).toLowerCase();
};
/**
 * Remove duplicates (realpath) and useless children folders
 */
exports.removeUselessFolders = function (folders) {
    // Remove duplicates
    var filteredFolders = folders.filter(function (elem, index) { return folders.indexOf(elem) === index; });
    var foldersToBeRemoved = [];
    filteredFolders.forEach(function (folder, i) {
        filteredFolders.forEach(function (subfolder, j) {
            if (subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) {
                foldersToBeRemoved.push(subfolder);
            }
        });
    });
    filteredFolders = filteredFolders.filter(function (elem) { return !foldersToBeRemoved.includes(elem); });
    return filteredFolders;
};
// TODO
exports.getDefaultMetadata = function () { return ({
    album: 'Unknown',
    artist: ['Unknown artist'],
    disk: {
        no: 0,
        of: 0
    },
    duration: 0,
    genre: [],
    loweredMetas: {
        artist: ['unknown artist'],
        album: 'unknown',
        title: '',
        genre: []
    },
    path: '',
    playCount: 0,
    title: '',
    track: {
        no: 0,
        of: 0
    },
    year: null
}); };
exports.parseMusicMetadata = function (data, trackPath) {
    var common = data.common, format = data.format;
    var metadata = {
        album: common.album,
        artist: common.artists || (common.artist && [common.artist]) || (common.albumartist && [common.albumartist]),
        disk: common.disk,
        duration: format.duration,
        genre: common.genre,
        title: common.title || path.parse(trackPath).base,
        track: common.track,
        year: common.year
    };
    // @ts-ignore
    return pickBy_1["default"](metadata);
};
exports.getLoweredMeta = function (metadata) { return ({
    artist: metadata.artist.map(function (meta) { return exports.stripAccents(meta.toLowerCase()); }),
    album: exports.stripAccents(metadata.album.toLowerCase()),
    title: exports.stripAccents(metadata.title.toLowerCase()),
    genre: metadata.genre.map(function (meta) { return exports.stripAccents(meta.toLowerCase()); })
}); };
exports.getAudioDuration = function (trackPath) {
    var audio = new Audio();
    return new Promise(function (resolve, reject) {
        audio.addEventListener('loadedmetadata', function () {
            resolve(audio.duration);
        });
        audio.addEventListener('error', function (e) {
            // @ts-ignore
            var message = "Error getting audio duration: (" + e.currentTarget.error.code + ") " + trackPath;
            reject(new Error(message));
        });
        audio.preload = 'metadata';
        // HACK no idea what other caracters could fuck things up
        audio.src = encodeURI(trackPath).replace('#', '%23');
    });
};
/**
 * Get a file metadata
 */
exports.getMetadata = function (trackPath) { return __awaiter(_this, void 0, void 0, function () {
    var defaultMetadata, basicMetadata, stats, data, parsedData, metadata, _a, err_1, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                defaultMetadata = exports.getDefaultMetadata();
                basicMetadata = __assign({}, defaultMetadata, { path: trackPath });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, , 9]);
                return [4 /*yield*/, stat(trackPath)];
            case 2:
                stats = _b.sent();
                return [4 /*yield*/, mmd.parseFile(trackPath, {
                        native: true, skipCovers: true, fileSize: stats.size, duration: true
                    })];
            case 3:
                data = _b.sent();
                parsedData = exports.parseMusicMetadata(data, trackPath);
                metadata = __assign({}, defaultMetadata, parsedData, { path: trackPath });
                metadata.loweredMetas = exports.getLoweredMeta(metadata);
                if (!!metadata.duration) return [3 /*break*/, 7];
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 7]);
                _a = metadata;
                return [4 /*yield*/, exports.getAudioDuration(trackPath)];
            case 5:
                _a.duration = _b.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _b.sent();
                console.warn("An error occured while getting " + trackPath + " duration: " + err_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/, metadata];
            case 8:
                err_2 = _b.sent();
                console.warn("An error occured while reading " + trackPath + " id3 tags: " + err_2);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, basicMetadata];
        }
    });
}); };
exports.fetchCover = function (trackPath) { return __awaiter(_this, void 0, void 0, function () {
    var data, picture, folder, pattern, matches, match;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!trackPath) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, mmd.parseFile(trackPath)];
            case 1:
                data = _a.sent();
                picture = data.common.picture && data.common.picture[0];
                if (picture) {
                    return [2 /*return*/, exports.parseBase64(picture.format, picture.data.toString('base64'))];
                }
                folder = path.dirname(trackPath);
                pattern = path.join(folder, '*');
                return [4 /*yield*/, globby(pattern, { followSymlinkedDirectories: false })];
            case 2:
                matches = _a.sent();
                match = matches.find(function (elem) {
                    var parsedPath = path.parse(elem);
                    return ['album', 'albumart', 'folder', 'cover'].includes(parsedPath.name.toLowerCase())
                        && ['.png', '.jpg', '.bmp', '.gif'].includes(parsedPath.ext.toLowerCase()); // TODO jpeg?
                });
                if (match)
                    return [2 /*return*/, match];
                return [2 /*return*/, null];
        }
    });
}); };

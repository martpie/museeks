const standardRoute = require('./utils/standardRoute');
const mapToObject = require('./utils/mapToObject');

const routeStrings = [    
    'load',
    'setTracksCursor',
    'resetTracks',
    'filterSearch',
    'addFolders',
    'removeFolder',
    'reset',
    'refresh',
    'fetchCover',
    'incrementPlayCount',
];

const routes = mapToObject(routeStrings, (route) => standardRoute(`library.${route}`));

module.exports = routes;
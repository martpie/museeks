const standardRoute = require('./utils/standardRoute');
const mapToObject = require('./utils/mapToObject');

const routeStrings = [
    'close',
    'init',
    'initShortcuts',
    'maximize',
    'minimize',
    'saveBounds',
    'start',
    'restart'
];

const routes = mapToObject(routeStrings, (route) => standardRoute(`app.${route}`));

module.exports = routes;
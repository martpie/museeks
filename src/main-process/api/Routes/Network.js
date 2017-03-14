const standardRoute = require('./utils/standardRoute');
const mapToObject = require('./utils/mapToObject');

const routeStrings = [    
];

const routes = mapToObject(routeStrings, (route) => standardRoute(`network.${route}`));

module.exports = routes;
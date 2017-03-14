// This will create a bunch of function that call the API

const routeData = require('../../shared/api/routeData');
const createApiFunctions = require('./utils/createApiFunctions');

module.exports = createApiFunctions(routeData);

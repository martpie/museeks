// This will create a bunch of function that call the API

const routes = require('../../shared/api/routes');
const createApiFunctions = require('./utils/createApiFunctions');

module.exports = createApiFunctions(routes);

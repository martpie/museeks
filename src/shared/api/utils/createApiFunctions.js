const axios = require('axios');
const { set } = require('lodash');

const createApiFunctions = (routes) => routes.reduce((apiLib, route) => {
    // Create a function that call the api
    const apiFunction = (config) => axios({
        ...config,
        method: route.method,
        url: `http://${config.ip || 'localhost'}:54321/${route.path}`
    });

    // Add it to the api lib
    set(apiLib, route.name, apiFunction);
    return apiLib;
}, {});


module.exports = createApiFunctions;

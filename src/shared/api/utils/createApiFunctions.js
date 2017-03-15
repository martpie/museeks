const axios = require('axios');

const createApiFunctions = (libs) => {

    const reduceLib = (lib) => lib.routes.reduce((routes, route) => {
        // Create a function that call this api
        routes[route.path] = (config) => axios({
            ...config,
            method: route.method,
            url: `http://${config.ip || 'localhost'}:54321/api/${lib.namespace}/${route.path}`
        })
        .then((response) => response.data);
        return routes;
    }, {});

    const reduceLibs = (libs) => libs.reduce((libs, lib) => {
        libs[lib.namespace] = reduceLib(lib);
        return output;
    }, {});

    return reduceLibs(libs);
}

module.exports = createApiFunctions;

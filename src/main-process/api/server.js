const express = require('express');
const routes = require('./Routes/index');

const flattenRoutesObject = (routesObject) => {
    const flatObject = {};
    Object.keys(routesObject).map(nameSpace => {
        Object.keys(routesObject[nameSpace]).map(routeName => {
            flatObject[`/api/${nameSpace}/${routeName}`] = routesObject[nameSpace][routeName];
        })
    });
    
    return flatObject;
}

class Api {
    constructor(send) {
        const server = express();

        // attach the send to all requests
        server.use((req, res, next) => {
            req.send = send;
            next();
        });
        
        const flatRoutes = flattenRoutesObject(routes);
        Object.keys(flatRoutes).map(routePath => {
            server.get(routePath, flatRoutes[routePath]);
        })        

        server.listen(54321);

        return server;
    }
}

module.exports = Api;
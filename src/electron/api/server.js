const Hapi = require('hapi');
const apiRoutes = require('./routes');
const actionRoutes = require('../../shared/api/routes');
const mapToRoutes = require('../../shared/api/utils/mapToRoutes');

class Api {
    constructor(store, lib) {

        const server = new Hapi.Server();

        server.connection({ port: 54321 });

        const routes = mapToRoutes([...apiRoutes, ...actionRoutes], lib);
        routes.forEach(route => server.route(route));

        // attach the libs and dispatcher to each request
        server.ext('onRequest', (req, res) => {
            req.lib = lib;
            req.store = store;
            return res.continue();
        });

        server.start();

        return server;
    }
}

module.exports = Api;

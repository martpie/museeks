const Hapi = require('hapi');
const apiRoutes = require('./routes');
const actionRoutes = require('../../shared/api/routes');
const mapToRoutes = require('../../shared/api/utils/mapToRoutes');
const lib = require('../library');

class Api {
    constructor(send) {

        const server = new Hapi.Server();

        server.connection({ port: 54321 });

        const routes = mapToRoutes([...apiRoutes, ...actionRoutes], send);
        routes.forEach(route => server.route(route));

        // attach the libs and dispatcher to each request
        server.ext('onRequest', (req, res) => {
            req.send = send;
            req.lib = lib;
            return res.continue();
        });

        server.start();

        return server;
    }
}

module.exports = Api;

const Hapi = require('hapi');
const routes = require('../../shared/api/routes');
const mapToRoutes = require('./utils/mapToRoutes');

class Api {
    constructor(send) {

        const server = new Hapi.Server();

        server.connection({ port: 54321 });

        const routes = mapToRoutes(routes, send);
        routes.forEach(route => server.route(route));

        server.start();

        return server;
    }
}

module.exports = Api;

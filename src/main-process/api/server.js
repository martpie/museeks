const Hapi = require('hapi');
const routeData = require('../../shared/api/routeData');
const mapToRoutes = require('./utils/mapToRoutes');

class Api {
    constructor(send) {

        const server = new Hapi.Server();

        server.connection({
            host: 'localhost',
            port: 54321
        });

        const routes = mapToRoutes(routeData, send);
        routes.forEach(route => server.route(route));

        server.start();

        return server;
    }
}

module.exports = Api;

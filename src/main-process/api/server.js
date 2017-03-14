const Hapi = require('hapi');
const apiRoutes = require('./routes');
const actionRoutes = require('../../shared/api/routes');
const mapToRoutes = require('../../shared/api/utils/mapToRoutes');

class Api {
    constructor(send) {

        const server = new Hapi.Server();

        server.connection({ port: 54321 });

        const routes = mapToRoutes([...apiRoutes, ...actionRoutes], send);
        routes.forEach(route => server.route(route));

        server.start();

        return server;
    }
}

module.exports = Api;

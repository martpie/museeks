const Hapi = require('hapi');

class Api {
    constructor(send) {

        const server = new Hapi.Server();

        server.connection({
            host: 'localhost',
            port: 54321
        });

        const routes = require('./routes')(send);
        routes.forEach(route => server.route(route));

        server.start();

        return server;
    }
}

module.exports = Api;

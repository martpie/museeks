import Hapi from 'hapi';
import routes from '../../shared/api/routes';
import routesToHandlers from '../../shared/api/handlers';

class ApiServer {

    constructor(lib) {
        this.lib = lib;
    }

    start() {
        this.server = new Hapi.Server({
            connections: {
                router: {
                    stripTrailingSlash: true
                }
            }
        });

        this.server.connection({
            port: this.lib.store.getState().config.electron.api.port
        });

        const handlers = routesToHandlers(routes, this.lib);

        this.server.route(handlers);

        // attach the libs and dispatcher to each request
        this.server.ext('onRequest', (req, res) => {
            req.lib = this.lib;
            res.continue();
        });

        this.server.start();
    }
}

export default ApiServer;

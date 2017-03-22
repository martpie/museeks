import Hapi from 'hapi';
import Inert from 'inert';
import routes from '../../shared/api/routes';
import routesToHandlers from '../../shared/api/routesToHandlers';

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

        // configure server
        const port = this.lib.store.getState().config.electron.api.port;
        this.server.connection({ port });

        // register server plugins
        this.server.register(Inert);

        const handlers = routesToHandlers(routes, this.lib);
        this.server.route(handlers);

        // attach the libs and dispatcher to each request
        this.server.ext('onRequest', (req, res) => {
            req.lib = this.lib;

            console.log(`${req.method} ${req.path}`);
            res.continue();
        });

        this.server.start();
    }
}

export default ApiServer;

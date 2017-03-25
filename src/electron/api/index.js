import hapi from 'hapi';
import inert from 'inert';
import etags from 'hapi-etags';
import routes from '../../shared/api/routes';
import routesToHandlers from '../../shared/api/routesToHandlers';

class ApiServer {

    constructor(lib) {
        this.lib = lib;
    }

    start() {
        this.server = new hapi.Server({
            connections: {
                router: {
                    stripTrailingSlash: true
                }
            }
        });

        // configure server
        const port = 54321;
        this.server.connection({ port });

        // register server plugins
        this.server.register(inert);
        this.server.register(etags);

        const handlers = routesToHandlers(routes, this.lib);
        this.server.route(handlers);

        // attach the libs and dispatcher to each request
        this.server.ext('onRequest', (req, res) => {
            req.lib = this.lib;

            console.log(`${req.method} ${req.path} ${Object.keys(req.payload || req.query).map(k => `${k}: ${req.query[k]}`)}`);
            res.continue();
        });

        this.server.start();
    }
}

export default ApiServer;

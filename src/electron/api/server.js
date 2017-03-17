import Hapi from 'hapi';
import otherRoutes from './routes';
import sharedRoutes from '../../shared/api/routes';
import mapToRoutes from '../../shared/api/utils/mapToRoutes';

class Api {
    constructor(store, lib) {

        const server = new Hapi.Server({
            connections: {
                router: {
                    stripTrailingSlash : true
                }
            }
        });

        server.connection({ port: 54321 });

        const routes = mapToRoutes([...otherRoutes, ...sharedRoutes], lib, store.dispatch);

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

export default Api;

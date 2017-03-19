import Hapi from 'hapi';
import serverRoutes from './routes';
import sharedRoutes from '../../shared/api/routes';
import routesToHandlers from '../../shared/api/handlers';

const initApi = (lib) => {

    const server = new Hapi.Server({
        connections: {
            router: {
                stripTrailingSlash: true
            }
        }
    });

    server.connection({
        port: lib.store.getState().config.api.port
    });

    const routes = routesToHandlers([...serverRoutes, ...sharedRoutes], lib);

    server.route(routes);

    // attach the libs and dispatcher to each request
    server.ext('onRequest', (req, res) => {
        req.lib = lib;
        res.continue();
    });

    server.start();

    return server;
}

export default initApi;

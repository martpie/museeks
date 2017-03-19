import Hapi from 'hapi';
import serverRoutes from './routes';
import sharedRoutes from '../../shared/api/routes';
import routesToHandlers from '../../shared/api/handlers';

const library = (store, lib) => {

    const server = new Hapi.Server({
        connections: {
            router: {
                stripTrailingSlash: true
            }
        }
    });

    server.connection({ port: 54321 });

    const routes = routesToHandlers([...serverRoutes, ...sharedRoutes], lib, store.dispatch);

    server.route(routes);

    // attach the libs and dispatcher to each request
    server.ext('onRequest', (req, res) => {
        req.lib = lib;
        req.store = store;
        return res.continue();
    });

    server.start();

    return server;
}

export default library;

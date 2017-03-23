import { get } from 'lodash';
import extend from 'xtend';
import Promise from 'bluebird';

const routesToHandlers = (routes, lib) => {

    // add a handler to a route that calls the corresponding internal library function
    const createHandler = (route) => {

        // the library function to be executed by this route
        const libraryFunction = get(lib, route.name);

        // return a function with the hapi route handler signature
        return (req, res) => {

            // get the function arguments
            const args = route.method === 'GET'
                ? req.query
                : req.payload;

            // optionally transform the arguments
            const transformedArgs = route.argTransform
                ? route.argTransform(args)
                : args;

            // wrap the function in a redux dispatch if required
            const dispatchedFunction = (inputs) => route.dispatch
                ? lib.store.dispatch(libraryFunction(inputs))
                : libraryFunction(inputs)

            return Promise.resolve(dispatchedFunction(transformedArgs))
                .then((result) => res(result || 'done'))
                .catch((error) => res({ error }).code(error.code));
        }
    }

    const routeWithHandler = (route) => ({
        method: route.method,
        path: `/${route.path}`,
        config: route.config,
        handler: route.handler || createHandler(route)
    });

    const routesWithHandlers = routes.map(routeWithHandler);

    return routesWithHandlers;
}

export default routesToHandlers;

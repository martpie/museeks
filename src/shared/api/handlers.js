import { get } from 'lodash';

const routesToHandlers = (routes, lib) => {

    // add a handler to a route that calls the corresponding internal library function
    const createRouteHandler = (route) => {

        const handler = (route) => {

            // the library function to be executed by this route
            const libraryFunction = get(lib, route.name);

            // return a function with the hapi route handler signature
            return (req, res) => {

                // Get the input args
                const args = route.method === 'GET'
                    ? req.query
                    : req.payload.data;

                // Transform the inputs
                const transformedArgs = route.argTransform
                    ? route.argTransform(args)
                    : args;

                // Wrap the function in a redux dispatch if required
                const dispatchedFunction = (args) => route.dispatch
                    ? lib.store.dispatch(libraryFunction.apply(null, args))
                    : libraryFunction.apply(null, args);

                return dispatchedFunction(transformedArgs)
                    .then((result) => res(result))
                    .catch((error) => res({ error }).code(error.code));
            }
        }

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        const routeWithHandler = {
            method: route.method,
            path: safeUrl(`/${route.path}`),
            handler: route.handler || handler(route)
        }

        return routeWithHandler;
    }

    return routes.map(createRouteHandler)
}

export default routesToHandlers;

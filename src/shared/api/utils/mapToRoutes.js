const { get } = require('lodash');
const mapApis = (apis, lib, dispatch) => {

    const createRouteHandlers = (route) => {

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        const handler = (route) => {
            // Get the function from the lib
            const functionFromLib = get(lib, route.name);

            if (functionFromLib) => {
                // Get the input args
                const args = route.method === 'GET' ? req.payload.params : req.payload.data;

                // Transform the inputs
                const transformedArgs = route.argTransform ? route.argTransform(args) : args;

                // Wrap the function in a redux dispatch if required
                const dispatchedFunction = (args) => route.dispatch
                    ? dispatch(functionFromLib.apply(null, args))
                    : functionFromLib(args);

                return (req, res) => dispatchedFunction(transformedArgs)
                    .then((result) => res(result))
                    .catch((error) => {
                        console.log('error', error)
                        res({ error }).code(error.code);
                    })

            } else {
                console.error(`Function not found: ${route.name} for ${route.path}`);
            }
        }

        const routeWithHandler = {
            method  : route.method,
            path    : safeUrl(`/${route.path}`),
            handler : route.handler || handler(route)
        }

        return routeWithHandler;
    }

    return apis.map(createRouteHandlers)
}

module.exports = mapApis;

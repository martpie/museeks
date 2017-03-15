const flatten = require('flatten');

const mapLibraries = (libraries, send) => {

    const createRouteHandlers = (library) => {

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        const handler = (route) => {
            return (req, res) => send(`${library.namespace}.${route.path}`, req.payload && req.payload.data)
            .then((result) => res(result))
            .catch((error) => {
                console.log('error', error)
                res({ error }).code(error.code);
            })
        }

        const routesWithHandlers = library.routes.map((route) => ({
            method : route.method,
            path : safeUrl(`/api/${library.namespace}/${route.path}`),
            handler : route.handler || handler(route)
        }));

        return routesWithHandlers;
    }

    return flatten(libraries.map(createRouteHandlers));
}

module.exports = mapLibraries;

const flatten = require('flatten');

const mapLibraries = (libraries, send) => {

    const createRouteHandlers = (library) => {

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        const routesWithHandlers = library.routes.map((route) => ({
            method : route.method,
            path : safeUrl(`/api/${library.namespace}/${route.path}`),
            handler : route.handler || (req, res) => send(`${library.namespace}.${route.path}`, req.payload)
                .then((result) => res(result))
                .catch((error) => res({ error }).code(error.code))
        }));

        return routesWithHandlers;
    }

    return flatten(libraries.map(createRouteHandlers));
}

module.exports = mapLibraries;

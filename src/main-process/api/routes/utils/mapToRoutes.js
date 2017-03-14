const flatten = require('flatten');

const mapLibraries = (libraries, send) => {

    const createRouteHandlers = (library) => {

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        // support objects and primitives on the data property
        const payloadData = (payload) => typeof payload.data === 'object'
            ? payload
            : payload.data;

        const handler = (req, res) => send(`${library.namespace}.${route.path}`, payloadData(req.payload))
            .then((result) => res(result))
            .catch((error) => res({ error }).code(error.code));

        const routesWithHandlers = library.routes.map((route) => ({
            method : route.method,
            path : safeUrl(`/api/${library.namespace}/${route.path}`),
            handler : route.handler || handler
        }));

        return routesWithHandlers;
    }

    return flatten(libraries.map(createRouteHandlers));
}

module.exports = mapLibraries;

const flatten = require('flatten');

const mapApis = (apis, lib) => {

    const createRouteHandlers = (api) => {

        // remove any double slashes created in urls
        const safeUrl = (url) => url.replace('//', '/');

        const handler = (route) => {
            return (req, res) => lib[api.namespace][route.path](req.payload && req.payload.data)
            .then((result) => res(result))
            .catch((error) => {
                console.log('error', error)
                res({ error }).code(error.code);
            })
        }

        const routesWithHandlers = api.routes.map((route) => ({
            method : route.method,
            path : safeUrl(`/api/${api.namespace}/${route.path}`),
            handler : route.handler || handler(route)
        }));

        return routesWithHandlers;
    }

    return flatten(apis.map(createRouteHandlers));
}

module.exports = mapApis;

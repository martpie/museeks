const routes = [{
    method: 'POST',
    path: '/',
    handler: (req, res) => req.lib[req.payload.library][req.payload.function](req.payload.data)
        .then((result) => res.status(200).json(result))
        .catch((error) => res.status(error.code).json({ error }));
}];

module.exports = {
    namespace: 'rpc',
    routes
};

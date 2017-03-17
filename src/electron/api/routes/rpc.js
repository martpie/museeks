module.exports = [{
    method: 'POST',
    path: 'api/v1/rpc',
    handler: (req, res) => {
        const rpc = req.payload;
        const target = req.lib[rpc.library][rpc.function];

        return target.apply(null, rpc.arguments)
            .then((result) => res.status(200).json(result))
            .catch((error) => res.status(error.code).json({ error }));
    }
}];

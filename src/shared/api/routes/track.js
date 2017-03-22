export default [{
    path: 'api/track/find',
    method: 'GET',
    name: 'track.find',
    handler: (req, res) => {
        const query = req.query.query;
        return req.lib.track.find({ query }).then(res);
    }
}, {
    path: 'api/track/findOne',
    method: 'GET',
    name: 'track.findOne',
    handler: (req, res) => {
        const query = req.query.query;
        return req.lib.track.findOne({ query }).then(res);
    }
}];

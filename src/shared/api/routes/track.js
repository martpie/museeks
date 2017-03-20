export default [{
    path: 'api/v1/tracks',
    method: 'GET',
    name: 'track.find',
    handler: (req, res) => req.lib.track.find(req.query).then(res)
}];

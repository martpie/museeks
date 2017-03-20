const flatten = require('flatten');

export default [{
    path: 'api/v1/library/load',
    method: 'GET',
    name: 'actions.library.load',
    dispatch: true
}, {
    path: 'api/v1/library/rescan',
    method: 'GET',
    name: 'actions.library.rescan',
    dispatch: true
}, {
    method: 'GET',
    path: 'api/v1/library',
    name: 'library.find',
    handler: (req, res) => {
        const getLibrary = (source) => lib.api.track.find(req.query);
        const querySources = Promise.map(req.query.sources, getLibrary);

        return querySources
        .then(flatten)
        .then(res);
    }
}];

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
}];

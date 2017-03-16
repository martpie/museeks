const routes = [{
    method: 'GET',
    path: 'load'
}, {
    method: 'GET',
    path: 'list'
}, {
    method: 'POST',
    path: 'setTracksCursor'
}, {
    method: 'GET',
    path: 'resetTrack'
}, {
    method: 'POST',
    path: 'filterSearch'
}, {
    method: 'POST',
    path: 'addFolders'
}, {
    method: 'GET',
    path: 'removeFolder'
}, {
    method: 'GET',
    path: 'reset'
}, {
    method: 'GET',
    path: 'refresh'
}, {
    method: 'GET',
    path: 'fetchCover'
}, {
    method: 'POST',
    path: 'incrementPlayCount'
}];

module.exports = {
    namespace: 'library',
    routes
};

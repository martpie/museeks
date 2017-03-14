const routes = [{
    method: 'GET',
    path: 'close'
}, {
    method: 'GET',
    path: 'init'
}, {
    method: 'GET',
    path: 'initShortcuts'
}, {
    method: 'GET',
    path: 'maximize'
}, {
    method: 'GET',
    path: 'minimize'
}, {
    method: 'GET',
    path: 'saveBounds'
}, {
    method: 'GET',
    path: 'start'
}, {
    method: 'GET',
    path: 'restart'
}];

module.exports = {
    namespace: 'app',
    routes
};

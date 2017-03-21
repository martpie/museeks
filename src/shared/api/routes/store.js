export default [{
    path: 'api/store/getState',
    method: 'GET',
    name: 'store.getState',
    handler: (req, res) => res(req.lib.store.getState())
}, {
    path: 'api/store/dispatch',
    method: 'POST',
    name: 'store.dispatch',
    handler: (req, res) => {
        req.lib.store.dispatch(req.payload);
        res();
    }
}];

export default [{
    path: 'api/v1/store/getState',
    method: 'GET',
    name: 'store.getState',
    dispatch: false,
    handler: (req, res) => res(req.lib.store.getState())
}, {
    path: 'api/v1/store/dispatch',
    method: 'POST',
    name: 'store.dispatch',
    dispatch: true,
    handler: (req, res) => {
        req.lib.store.dispatch(req.payload);
        res();
    }
}];

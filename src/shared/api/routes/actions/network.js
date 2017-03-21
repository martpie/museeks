export default [{
    path: 'api/actions/network/observe',
    method: 'POST',
    name: 'actions.network.addObserver',
    dispatch: true
}, {
    path: 'api/actions/network/observe',
    method: 'DELETE',
    name: 'actions.network.removeObserver',
    dispatch: true
}, {
    path: 'api/actions/network/event',
    method: 'POST',
    name: 'actions.network.event',
    dispatch: true
}, {
    method: 'GET',
    path: 'api/actions/network/find',
    name: 'actions.network.find',
    dispatch: true
}, {
    method: 'POST',
    path: 'api/actions/network/start',
    name: 'actions.network.start',
    dispatch: true
}];

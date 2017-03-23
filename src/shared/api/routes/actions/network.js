export default [{
    path: 'api/actions/network/connectOutput',
    method: 'POST',
    name: 'actions.network.connectAsOutput',
    dispatch: true
}, {
    path: 'api/actions/network/disconnectOutput',
    method: 'DELETE',
    name: 'actions.network.disconnectAsOutput',
    dispatch: true
}];

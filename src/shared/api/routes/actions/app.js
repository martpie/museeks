export default [{
    path: 'api/actions/app/close',
    method: 'GET',
    name: 'actions.app.close',
    dispatch: true
}, {
    path: 'api/actions/app/restart',
    method: 'GET',
    name: 'app.restart',
    dispatch: false
}];

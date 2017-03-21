import Joi from 'joi';

export default [{
    path: 'api/network/observe',
    method: 'POST',
    name: 'actions.network.addObserver',
    dispatch: true
}, {
    path: 'api/network/observe',
    method: 'DELETE',
    name: 'actions.network.removeObserver',
    dispatch: true
}, {
    path: 'api/network/event',
    method: 'POST',
    name: 'actions.network.event',
    dispatch: true
}, {
    method: 'GET',
    path: 'api/network/find',
    name: 'actions.network.find',
    dispatch: true
}, {
    method: 'POST',
    path: 'api/network/start',
    name: 'actions.network.start',
    dispatch: true
}];

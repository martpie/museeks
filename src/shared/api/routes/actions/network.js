import Joi from 'joi';

export default [{
    path: 'api/v1/network/observe',
    method: 'POST',
    name: 'actions.network.addObserver',
    dispatch: true
}, {
    path: 'api/v1/network/observe',
    method: 'DELETE',
    name: 'actions.network.removeObserver',
    dispatch: true
}, {
    path: 'api/v1/network/event',
    method: 'POST',
    name: 'actions.network.event',
    dispatch: true
}, {
    method: 'GET',
    path: 'api/v1/network/find',
    name: 'actions.network.find',
    dispatch: true
}, {
    method: 'POST',
    path: 'api/v1/network/start',
    name: 'actions.network.start',
    dispatch: true
}];

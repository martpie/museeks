import http from 'axios';

const routeInfo = [{
    actionType: 'PLAYER/PLAY',
    path: 'api/v1/actions/player/play',
    method: 'GET',
  }, {
    actionType: 'PLAYER/PAUSE',
    path: 'api/v1/actions/player/pause',
    method: 'GET',
  }
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const { observers } = store.getState().network;

    const route = routeInfo.find((route) => route.actionType == action.type);

    if (route) {
        const inputType = route.method === 'GET'
            ? 'params'
            : 'data';

        const sendActionToObserver = (observer) => {
            return http({
                url: `http://${observer.ip}/${route.path}`,
                method: route.method,
                [inputType]: action.payload,
            })
        };

        observers.forEach((observer) => {
            sendActionToObserver(observer);
        });
    }

    return next(action);
};

export default sendToObservers;

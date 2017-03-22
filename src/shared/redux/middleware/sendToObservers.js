import http from 'axios';

const routeInfo = [
    'PLAYER/PAUSE',
    'PLAYER/PLAY'
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const { observers } = store.getState().network;

    if (routeInfo.includes(action.type)) {
        const sendActionToObserver = (observer) => {
            return http({
                url: `http://${observer.ip}/$/api/store/dispatch`, // TODO: Jackson
                method: 'POST',
                data: action,
            })
        };

        observers.forEach((observer) => {
            sendActionToObserver(observer);
        });
    }

    return next(action);
};

export default sendToObservers;

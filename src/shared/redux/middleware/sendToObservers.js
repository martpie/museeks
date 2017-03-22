import http from 'axios';

const observerActions = [
    'PLAYER/PAUSE',
    'PLAYER/PLAY'
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const state = store.getState();
    const protocol = config.renderer.api.protocol;
    const port = config.electron.api.port;

    if (observerActions.includes(action.type)) {

        const sendActionToObserver = (observer) => {
            return http({
                url: `${protocol}://${observer.ip}:${port}/api/store/dispatch`,
                method: 'POST',
                data: action
            })
        };

        state.network.observers.forEach((observer) => {
            sendActionToObserver(observer);
        });
    }

    return next(action);
};

export default sendToObservers;

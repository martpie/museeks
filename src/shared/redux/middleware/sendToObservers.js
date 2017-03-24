import http from 'axios';

const observerActions = [
    'PLAYER/PAUSE',
    'PLAYER/PLAY',
    'PLAYER/STOP',
    'PLAYER/NEXT',
    'PLAYER/PREVIOUS',
    'PLAYER/START',
    'PLAYER/SHUFFLE',
    'PLAYER/REPEAT',
    'PLAYER/JUMP_TO',
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const state = store.getState();

    if (observerActions.includes(action.type)) {

        const sendActionToObserver = (observer) => {
            return http({
                url: `http://${observer.ip}:54321/api/store/dispatch`,
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

import http from 'axios';
import lib from '../../lib';

const observerActions = [
    'PLAYER/PAUSE',
    'PLAYER/PLAY',
    'PLAYER/STOP',
    'PLAYER/NEXT',
    'PLAYER/PREVIOUS',
    'PLAYER/START',
    'PLAYER/SHUFFLE',
    'PLAYER/REPEAT',
    'PLAYER/JUMP_TO'
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const { network } = store.getState();

    if (observerActions.includes(action.type)) {
console.log(network.observers);
        const sendActionToObserver = (observer) => {
            return http({
                url: lib.utils.dispatchEndpoint({ peer: observer }),
                method: 'POST',
                data: action
            })
        };

        network.observers.forEach((observer) => {
            sendActionToObserver(observer);
        });
    }

    return next(action);
};

export default sendToObservers;

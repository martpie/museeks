export default (state = {}, action) => {
    switch (action.type) {

        case('APP_NETWORK_PEER_FOUND'): {

            const newPeer = action.payload.peer;
            const peers = state.peers.slice();

            // if the peers list doesn't include the found peer, add it
            if (peers.every((peer) => peer.ip !== newPeer.ip)) {
                peers.push(newPeer);
            }

            return {
                ...state,
                peers
            };
        }

        case('APP_NETWORK_ADD_OBSERVER'): {

            const newObserver = action.payload.peer;
            const observers = state.observers.slice();

            // if the observers list doesn't include the new observer, add it
            if (observers.every((observer) => observer.ip !== newObserver.ip)) {
                observers.push(newObserver);
            }

            return {
                ...state,
                observers
            };
        }

        case('APP_NETWORK_REMOVE_OBSERVER'): {

            const targetObserver = action.payload.peer;

            return {
                ...state,
                observers: state.observers.filter((observer) => observer.ip === targetObserver.ip)
            };
        }

        default: {
            return state;
        }
    }
};

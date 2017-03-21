import i from 'icepick';
import { find } from 'lodash';

export default (state = {}, action) => {
    switch (action.type) {

        case('APP_NETWORK_PEER_FOUND'): {
            const newPeer = action.payload.peer;
            return i.updateIn(state, ['network', 'peers'], (peers) => {
                // if the peers list doesn't include the found peer, add it
                return find(peers, ['ip', newPeer.ip]) ? peers : i.push(peers, newPeer);
            })
        }

        case('APP_NETWORK_ADD_OBSERVER'): {
            const newObserver = action.payload.peer;
            return i.updateIn(state, ['network', 'observers'], (observers) => {
                // if the observers list doesn't include the new observer, add it
                return find(observers, ['ip', newObserver.ip]) ? observers : i.push(observers, newObserver);
            })
        }

        case('APP_NETWORK_REMOVE_OBSERVER'): {
            const targetObserver = action.payload.peer;
            return i.updateIn(state, ['network', 'observers'], (observers) => {
                // filter the list to remove the targetObserver
                return observers.filter(observer => observer.ip !== targetObserver.ip);
            })
        }

        default: {
            return state;
        }
    }
};

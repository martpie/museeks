import i from 'icepick';
import { find } from 'lodash';

export default (state = {}, action) => {
    switch (action.type) {

        case('NETWORK/SET_ME'): {
            return i.assoc(state, 'me', action.payload);
        }

        case('NETWORK/SCAN_PEERS_PENDING'): {
            return i.assoc(state, 'scanPending', true);
        }
        case('NETWORK/SCAN_PEERS_REJECTED'): {
            return i.assoc(state, 'scanPending', false);
        }
        case('NETWORK/SCAN_PEERS_FULFILLED'): {
            return i.assoc(state, 'scanPending', false);
        }

        case('NETWORK/PEER_FOUND'): {
            const newPeer = action.payload.peer;
            return i.updateIn(state, ['peers'], (peers) => {
                // if the peers list doesn't include the found peer, add it
                return find(peers, ['ip', newPeer.ip])
                    ? peers
                    : i.push(peers, newPeer);
            });
        }

        case('NETWORK/ADD_OBSERVER'): {
            const newObserver = action.payload.peer;
            return i.updateIn(state, ['observers'], (observers) => {
                // if the observers list doesn't include the new observer, add it
                return find(observers, ['ip', newObserver.ip])
                    ? observers
                    : i.push(observers, newObserver);
            });
        }

        case('NETWORK/REMOVE_OBSERVER'): {
            const targetObserver = action.payload.peer;
            return i.updateIn(state, ['observers'], (observers) => {
                // filter the list to remove the targetObserver
                return observers.filter(observer => observer.ip !== targetObserver.ip);
            });
        }

        case('NETWORK/SET_OUTPUT_PENDING'): {
            return i.assoc(state, 'output', action.meta.newOutput);
        }

        case('NETWORK/SET_OUTPUT_REJECTED'): {
            return i.assoc(state, 'output', action.meta.prevOutput);
        }

        default: {
            return state;
        }
    }
};

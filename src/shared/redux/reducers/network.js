import i from 'icepick';
import { find } from 'lodash';

export default (state = {}, action) => {
    switch (action.type) {

        case('NETWORK/PEER_FOUND'): {
            const newPeer = action.payload.peer;
            return i.updateIn(state, ['network', 'peers'], (peers) => {
                // if the peers list doesn't include the found peer, add it
                return find(peers, ['ip', newPeer.ip])
                    ? peers
                    : i.push(peers, newPeer);
            });
        }

        case('NETWORK/ADD_OBSERVER'): {
            const newObserver = action.payload.peer;
            return i.updateIn(state, ['network', 'observers'], (observers) => {
                // if the observers list doesn't include the new observer, add it
                console.log(action)
                return find(observers, ['ip', newObserver.ip])
                    ? observers
                    : i.push(observers, newObserver);
            });
        }

        case('NETWORK/REMOVE_OBSERVER'): {
            const targetObserver = action.payload.peer;
            return i.updateIn(state, ['network', 'observers'], (observers) => {
                // filter the list to remove the targetObserver
                return observers.filter(observer => observer.ip !== targetObserver.ip);
            });
        }

        case('NETWORK/SET_OUTPUT_PENDING'): {
            return i.assocIn(state, ['network', 'output'], action.meta.newOutput);
        }
        case('NETWORK/SET_OUTPUT_REJECTED'): {
            return i.assocIn(state, ['network', 'output'], action.meta.oldOutput);
        }

        case('NETWORK/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            return {
                ...state,
                tracks: {
                    library: {
                        all: [...action.payload],
                        sub: [...action.payload]
                    },
                    playlist: {
                        all: [],
                        sub: []
                    }
                }
            };
        }

        case('NETWORK/FETCHED_COVER'): {
            return {
                ...state,
                cover: action.payload.cover || null
            };
        }

        default: {
            return state;
        }
    }
};

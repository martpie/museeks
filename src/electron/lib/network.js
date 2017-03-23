import Promise from 'bluebird';
import { flatten, compact, extend } from 'lodash';

const library = (lib) => {

    const attachOwnerMetadata = (peer, item) => item
        ? extend(item, { owner: peer })
        : item;

    const find = ({ peer, query, sort } = {}) => {
        console.log({
            ip: peer.ip,
            query,
            sort
        })

        return lib.api.track.find(peer, {
            query,
            sort
        })
        .then((tracks) => tracks.map((track) => attachOwnerMetadata(peer, track)));
    }

    const findOne = ({ peer, query } = {}) => {
        return lib.api.track.findOne({
            ip: peer.ip,
            query
        })
        .then((track) => attachOwnerMetadata(peer, track));
    }

    const getOwner = (query) => {

        const { peers } = lib.store.getState().network;

        // asks a peer if they have the file. returns the peer if the file was found
        const checkIsOwner = (peer) => {
            return lib.network.findOne({
                peer, query
            }).then((track) => track
                ? peer
                : undefined
            );
        }

        return Promise.map(peers, checkIsOwner)
        .then(flatten)
        .then(compact)
        .then((peers) => peers[0])
        .then((owner) => owner
            ? owner
            : Promise.reject(new Error('Owner not found!'))
        );
    }

    const start = (data) => {
        return lib.models.playlist.findAsync(data.query);
    }

    return {
        find,
        findOne,
        getOwner,
        start
    };
}

export default library;

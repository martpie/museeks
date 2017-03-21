import Promise from 'bluebird';
import { flatten, compact } from 'lodash';

const library = (lib) => {

    const find = ({ peer, query, sort } = {}) => {
        return lib.api.network.find({
            ip: peer.ip,
            query,
            sort
        });
    }

    const findOne = ({ peer, query, sort } = {}) => {
        return lib.api.network.findOne({
            ip: peer.ip,
            query,
            sort
        })
    }

    const getOwner = (query) => {

        // asks a peer if they have the file. returns the peer if the file was found
        const checkIsOwner = (peer) => {
            return lib.network.findOne({
                ip: peer.ip,
                query
            }).then((track) => track
                ? peer
                : undefined
            );
        }

        const peers = lib.store.getState().network.peers;
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

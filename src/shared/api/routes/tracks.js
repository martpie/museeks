import Joi from 'joi';
import Boom from 'boom';
import utils from '../../utils/utils';

export default [{
    path: 'api/tracks/find',
    method: 'GET',
    name: 'track.find',
    handler: (req, res) => {
        const query = req.query.query;
        return req.lib.track.find({ query }).then(res);
    }
}, {
    path: 'api/tracks/download',
    method: 'GET',
    name: 'track.download',
    config: {
        validate: {
            query: {
                _id: Joi.required()
            }
        }
    },
    handler: (req, res) => {
        const query = req.query;
        return req.lib.track.findOne({ query }).then((track) => !track
            ? res(Boom.notFound())
            : res.file(track.path, { confine : false })
        );
    }
}, {
    path: 'api/tracks/cover',
    method: 'GET',
    name: 'track.cover',
    config: {
        validate: {
            query: {
                _id: Joi.required()
            }
        }
    },
    handler: (req, res) => {
        const { _id } = req.query;
        const track = req.lib.store.getState().tracks.library.data[_id];

        if (!track) {
            res(Boom.notFound());
        } else {
            return utils.fetchCover(track.path).then((art) => {
                if (art.format === 'base64') {
                    res(art.data);
                } else {
                    res.file(art.data, { confine : false });
                }
            });
        }
    }
}, {
    path: 'api/tracks/history',
    method: 'GET',
    name: 'track.history',
    handler: (req, res) => {
        const { query } = req.query;
        return req.lib.playEvent.find({ query, sort: { timestamp: -1 } }).then(res);
    }
}];

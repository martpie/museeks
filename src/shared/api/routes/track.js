import Joi from 'joi';
import Boom from 'boom';
import utils from '../../utils/utils';

export default [{
    path: 'api/track/find',
    method: 'GET',
    name: 'track.find',
    handler: (req, res) => {
        const query = req.query.query;
        return req.lib.track.find({ query }).then(res);
    }
}, {
    path: 'api/track/findOne',
    method: 'GET',
    name: 'track.findOne',
    handler: (req, res) => {
        const query = req.query.query;
        return req.lib.track.findOne({ query }).then(res);
    }
}, {
    path: 'api/track/download',
    method: 'GET',
    name: 'track.download',
    config : {
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
    path: 'api/track/fetchCover',
    method: 'GET',
    name: 'track.fetchCover',
    config : {
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
            : utils.fetchCover(track.path).then((path) => {
                res.file(path, { confine : false });
            })
        );
    }
}];

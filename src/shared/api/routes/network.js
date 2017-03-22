import Joi from 'joi';
import utils from '../../utils/utils';

export default [{
    path: 'api/network/download',
    method: 'GET',
    name: 'network.download',
    config : {
        validate: {
            query: {
                _id: Joi.required()
            }
        }
    },
    handler: (req, res) => {
        const query = req.query;
        return req.lib.track.findOne({ query }).then((track) => {
            return res.file(track.path, { confine : false });
        });
    }
}, {
    path: 'api/network/fetchCover',
    method: 'GET',
    name: 'network.fetchCover',
    config : {
        validate: {
            query: {
                _id: Joi.required()
            }
        }
    },
    handler: (req, res) => {
        const query = req.query;
        return req.lib.track.findOne({ query }).then((track) => {
            return utils.fetchCover(track.path).then((path) => {
                return res.file(path, { confine : false });
            });
        });
    }
}];

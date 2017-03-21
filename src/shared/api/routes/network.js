import Joi from 'joi';

export default [{
    method: 'GET',
    path: 'api/network/download',
    name: 'network.download',
    config: {
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
    method: 'GET',
    path: 'api/network/metadata',
    name: 'network.metadata',
    config: {
        validate: {
            query: {
                _id: Joi.required()
            }
        }
    },
    handler: (req, res) => {
        const query = req.query;
        return req.lib.track.findOne({ query }).then(res);
    }
}];

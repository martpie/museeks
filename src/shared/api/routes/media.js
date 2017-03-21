import Joi from 'joi';

export default [{
    method: 'GET',
    path: 'api/media',
    name: 'media',
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
}];

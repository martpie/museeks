const aliasEmit    = require('./aliasEmit');
const aliasReceive = require('./aliasReceive.middleware');
const aliasResponse = require('./aliasResponse.middleware');

module.exports = {
    aliasEmit,
    aliasReceive,
    aliasResponse,
}

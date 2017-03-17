import os from 'os';
import extend from 'xtend';

export default [{
    method: 'POST',
    path: 'api/v1/handshake',
    handler: (req, res) => {
        const peer = extend(req.payload, { ip : req.info.remoteAddress });
        req.lib.actions.network.peerFound(peer);
        res({
            hostname: os.hostname(),
            platform: os.platform()
        });
    }
}];

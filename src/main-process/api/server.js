const express = require('express');
const { getTracks, getPlaylists } from './routes.js';

class Api {
    constructor(send) {
        const send = express();

        // attach the send to all requests
        server.use((req, res, next) => {
            req.send = send;
            next();
        });

        server.get('/api/tracks', getTracks);
        server.get('/api/playlist', getPlaylists);

        server.listen(54321);

        return server;
    }
}

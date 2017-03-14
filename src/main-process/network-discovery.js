const Promise = require('bluebird');
const bonjour = require('bonjour')();

// advertise an HTTP server on port 3000
bonjour.publish({ name: 'museeks', type: 'museeks-discovery', port: 54322 })

// browse for all museeks services
const peers = bonjour.find({ type: 'museeks-discovery' });

peers.on('up', (peer) => {
    console.log('Found an HTTP server:', peer)
});

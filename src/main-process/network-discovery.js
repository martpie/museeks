const Promise = require('bluebird');
const flatten = require('flatten');
const evilscan = require('evilscan');
const range = require('range').range;
const os = require('os');


const lookup = new evilscan({
    ips : '127.0.0.1',
    ports : 54321
});

lookup.on('result', (data) => {
    console.log('scan got result', data);
});

return;

const interfaces = flatten(Object.values(os.networkInterfaces()));

// only scan private ipv4 interfaces - ipv6 networks are likely virtual
const ipv4Interfaces = interfaces.filter(interface => interface.family === 'IPv4')
const networkInterfaces = ipv4Interfaces.filter(interface => !interface.internal);

const scan = (target) => new Promise((resolve, reject) => {
    console.log(target)
    const lookup = new evilscan({
        target,
        ports : 54321
    });

    lookup.on('result', (data) => {
        console.log('scan got result', data);
    });
});

return Promise.map(networkInterfaces, (interface) => {
    const ipPrefix = interface.address.split('.').slice(0, -1).join('.');
    const ipRange = range(0, 255).map(address => `${ipPrefix}.${address}`);
    return Promise.map(ipRange, scan);
});

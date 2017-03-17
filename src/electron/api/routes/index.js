import handshake from './handshake';
import rpc from './rpc';

const routes = [
    ...handshake,
    ...rpc
];

export default routes;

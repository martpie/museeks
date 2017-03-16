import { rpcWrap } from '../../shared/modules/rpc';
import track from '../../electron/lib/track';

const functions = Object.keys(track);

// make track functions invoked in the renderer execute in electron via rpc
export default rpcWrap('track', functions, 'electron');

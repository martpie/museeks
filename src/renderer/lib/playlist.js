import { rpcWrap } from '../../shared/modules/rpc';
import playlist from '../../electron/lib/playlist';

const functions = Object.keys(playlist);

// make playlist functions invoked in the renderer execute in electron via rpc
export default rpcWrap('playlist', functions, 'electron');

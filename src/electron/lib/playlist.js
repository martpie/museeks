import { rpcWrap } from '../../shared/modules/rpc';
import playlist from '../../renderer/lib/playlist';

const functions = Object.keys(playlist);

// make playlist functions invoked in electron execute in the renderer via rpc
export default rpcWrap('playlist', functions, 'main-renderer');

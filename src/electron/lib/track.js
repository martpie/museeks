import { rpcWrap } from '../../shared/modules/rpc';
import track from '../../renderer/lib/track';

const functions = Object.keys(track);

// make playlist functions invoked in electron execute in the renderer via rpc
export default rpcWrap('track', functions, 'main-renderer');

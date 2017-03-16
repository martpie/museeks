import rpcWrap from '../../shared/modules/rpc'
import actions from '../../shared/redux/actions';
import api from '../../shared/api';

import rpc from './rpc';
import player from './player';

export default {
    actions: rpc.actions,
    api,
    player,
    track: rpcWrap('track', ['pause', 'play'], 'mainRenderer'),
    playlist: rpcWrap('playlist', ['pause', 'play'], 'mainRenderer')
}

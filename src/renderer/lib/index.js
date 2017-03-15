import actions  from '../../shared/redux/actions';
import api      from '../../shared/api';
import rpc      from './rpc';
import player   from './player';

export default {
    actions,
    api,
    player,
    track: rpc.track,
    playlist: rpc.playlist
}

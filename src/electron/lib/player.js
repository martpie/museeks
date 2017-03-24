import { rpc } from 'electron-simple-rpc';

export default {
    getAudio: rpc('main-renderer', 'player.getAudio')
};

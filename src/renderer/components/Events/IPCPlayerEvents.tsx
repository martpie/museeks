import { ipcRenderer } from 'electron';
import { useEffect } from 'react';

import channels from '../../../shared/lib/ipc-channels';
import usePlayerStore from '../../stores/usePlayerStore';
import useCurrentViewTracks from '../../hooks/useCurrentViewTracks';

const { player } = window.MuseeksAPI;

/**
 * Handle app-level IPC Events init and cleanup
 */
function IPCPlayerEvents() {
  const playerAPI = usePlayerStore.getState().api;
  const tracks = useCurrentViewTracks();

  useEffect(() => {
    function play() {
      if (player.getTrack()) {
        playerAPI.play();
      } else {
        playerAPI.start(tracks);
      }
    }

    function onPlay() {
      const track = player.getTrack();

      if (!track) throw new Error('Track is undefined');

      ipcRenderer.send(channels.PLAYBACK_PLAY, track ?? null);
      ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);
    }

    function onPause() {
      ipcRenderer.send(channels.PLAYBACK_PAUSE);
    }

    ipcRenderer.on(channels.PLAYBACK_PLAY, play);
    ipcRenderer.on(channels.PLAYBACK_PAUSE, playerAPI.pause);
    ipcRenderer.on(channels.PLAYBACK_PLAYPAUSE, playerAPI.playPause);
    ipcRenderer.on(channels.PLAYBACK_PREVIOUS, playerAPI.previous);
    ipcRenderer.on(channels.PLAYBACK_NEXT, playerAPI.next);
    ipcRenderer.on(channels.PLAYBACK_STOP, playerAPI.stop);

    player.getAudio().addEventListener('play', onPlay);
    player.getAudio().addEventListener('pause', onPause);

    return function cleanup() {
      ipcRenderer.off(channels.PLAYBACK_PLAY, play);
      ipcRenderer.off(channels.PLAYBACK_PAUSE, playerAPI.pause);
      ipcRenderer.off(channels.PLAYBACK_PLAYPAUSE, playerAPI.playPause);
      ipcRenderer.off(channels.PLAYBACK_PREVIOUS, playerAPI.previous);
      ipcRenderer.off(channels.PLAYBACK_NEXT, playerAPI.next);
      ipcRenderer.off(channels.PLAYBACK_STOP, playerAPI.stop);

      player.getAudio().removeEventListener('play', onPlay);
      player.getAudio().removeEventListener('pause', onPause);
    };
  });

  return null;
}

export default IPCPlayerEvents;

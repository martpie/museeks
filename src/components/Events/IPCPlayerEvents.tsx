import { useEffect } from 'react';
import { getCurrent } from '@tauri-apps/api/webviewWindow';

import { usePlayerAPI } from '../../stores/usePlayerStore';
import player from '../../lib/player';
import { IPCEvent } from '../../generated/typings';

/**
 * Handle back-end events attempting to control the player
 * IMPROVE ME: this should probably be refactored in some ways, the player should
 * send Tauri events, and there should only be listeners here.
 */
function IPCPlayerEvents() {
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    const { listen, emit } = getCurrent();

    function emitPlayToBackEnd() {
      const track = player.getTrack();

      if (!track) throw new Error('Track is undefined');

      emit('PlaybackPlay' satisfies IPCEvent, track ?? null);
      emit('PlaybackTrackChange' satisfies IPCEvent, track);
    }

    function emitPauseToBackend() {
      emit('PlaybackPause' satisfies IPCEvent);
    }

    const unlisteners = [
      listen('PlaybackPlay' satisfies IPCEvent, playerAPI.play),
      listen('PlaybackPause' satisfies IPCEvent, playerAPI.pause),
      listen('PlaybackPlayPause' satisfies IPCEvent, playerAPI.playPause),
      listen('PlaybackPrevious' satisfies IPCEvent, playerAPI.previous),
      listen('PlaybackNext' satisfies IPCEvent, playerAPI.next),
      listen('PlaybackStop' satisfies IPCEvent, playerAPI.stop),
    ];

    player.getAudio().addEventListener('play', emitPlayToBackEnd);
    player.getAudio().addEventListener('pause', emitPauseToBackend);

    return function cleanup() {
      Promise.all(unlisteners).then((values) => {
        values.forEach((u) => u());
      });

      player.getAudio().removeEventListener('play', emitPlayToBackEnd);
      player.getAudio().removeEventListener('pause', emitPauseToBackend);
    };
  }, [playerAPI]);

  return null;
}

export default IPCPlayerEvents;

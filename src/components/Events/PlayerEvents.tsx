import { getCurrent } from '@tauri-apps/api/window';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { useEffect } from 'react';

import config from '../../lib/config';
import { getCover } from '../../lib/cover';
import player from '../../lib/player';
import { logAndNotifyError } from '../../lib/utils';
import { useLibraryAPI } from '../../stores/useLibraryStore';
import { usePlayerAPI } from '../../stores/usePlayerStore';
import { useToastsAPI } from '../../stores/useToastsStore';

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound:
    'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

/**
 * Handle app-level IPC Events init and cleanup
 */
function PlayerEvents() {
  const playerAPI = usePlayerAPI();
  const libraryAPI = useLibraryAPI();
  const toastsAPI = useToastsAPI();

  useEffect(() => {
    function handleAudioError(e: ErrorEvent) {
      playerAPI.stop();

      const element = e.target as HTMLAudioElement;

      if (element) {
        const { error } = element;

        if (!error) return;

        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            toastsAPI.add('warning', AUDIO_ERRORS.aborted);
            break;
          case error.MEDIA_ERR_DECODE:
            toastsAPI.add('danger', AUDIO_ERRORS.corrupt);
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            toastsAPI.add('danger', AUDIO_ERRORS.notFound);
            break;
          default:
            toastsAPI.add('danger', AUDIO_ERRORS.unknown);
            break;
        }
      }
    }

    async function notifyTrackChange() {
      const track = player.getTrack();
      const isEnabled = await config.get('notifications');
      const isMinimized = await getCurrent()
        .isMinimized()
        .catch(logAndNotifyError);
      const isFocused = await getCurrent().isFocused().catch(logAndNotifyError);

      if (track == null || !isEnabled || isFocused || !isMinimized) {
        return;
      }

      // FIXME: cover is not working as intended
      const cover = await getCover(track.path);

      sendNotification({
        title: track.title,
        body: `${track.artists.join(', ')}\n${track.album}`,
        silent: true,
        icon: cover ?? undefined,
        // TODO: onClick event https://github.com/tauri-apps/tauri/issues/3698
        // show + focus + unminimize
      });
    }

    // Bind player events
    // Audio Events
    player.getAudio().addEventListener('play', notifyTrackChange);
    player.getAudio().addEventListener('error', handleAudioError);
    player.getAudio().addEventListener('ended', playerAPI.next);

    return function cleanup() {
      player.getAudio().removeEventListener('play', notifyTrackChange);
      player.getAudio().removeEventListener('ended', playerAPI.next);
      player.getAudio().removeEventListener('error', handleAudioError);
    };
  }, [libraryAPI, toastsAPI, playerAPI]);

  return null;
}

export default PlayerEvents;

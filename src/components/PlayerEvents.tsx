import { getCurrentWindow } from '@tauri-apps/api/window';
import { error as logError } from '@tauri-apps/plugin-log';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { useEffect } from 'react';

import config from '../lib/config';
import { getCover } from '../lib/cover';
import player from '../lib/player';
import { logAndNotifyError } from '../lib/utils';
import { usePlayerAPI } from '../stores/usePlayerStore';

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound:
    'The track file could not be loaded. It may be due to a file move, an unmounted partition or missing rights.',
  unknown: 'An unknown error occurred.',
};

/**
 * Handle some of the logic regarding the player. Technically, it should not be there,
 * but part of the Player library, but cleaning up events in case of hot-reload is tough
 */
function PlayerEvents() {
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    function handleAudioError(e: ErrorEvent) {
      playerAPI.stop();

      const element = e.target as HTMLAudioElement;

      if (element) {
        const { error } = element;

        if (!error) return;

        let errorMessage;

        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = AUDIO_ERRORS.aborted;
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = AUDIO_ERRORS.corrupt;
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = AUDIO_ERRORS.notFound;
            break;
          default:
            errorMessage = AUDIO_ERRORS.unknown;
            break;
        }

        logAndNotifyError(errorMessage);
        logError(player.getDebug());
      }
    }

    async function notifyTrackChange() {
      const track = player.getTrack();
      const isEnabled = await config.get('notifications');
      const isMinimized = await getCurrentWindow()
        .isMinimized()
        .catch(logAndNotifyError);
      const isFocused = await getCurrentWindow()
        .isFocused()
        .catch(logAndNotifyError);

      if (track == null || !isEnabled || isFocused || !isMinimized) {
        return;
      }

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
      player.getAudio().removeEventListener('error', handleAudioError);
      player.getAudio().removeEventListener('ended', playerAPI.next);
    };
  }, [playerAPI]);

  return null;
}

export default PlayerEvents;

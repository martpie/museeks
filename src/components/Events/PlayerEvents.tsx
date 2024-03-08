import { useEffect } from 'react';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { getCurrent } from '@tauri-apps/api/window';

import { usePlayerAPI } from '../../stores/usePlayerStore';
import { useToastsAPI } from '../../stores/useToastsStore';
import { useLibraryAPI } from '../../stores/useLibraryStore';
import player from '../../lib/player';
import config from '../../lib/config';
import { logAndNotifyError } from '../../lib/utils';

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

  // // If no queue is provided, we create it based on the screen the user is on
  // if (!newQueue) {
  //   if (hash.startsWith('#/playlists')) {
  //     newQueue = library.tracks.playlist;
  //     newQueue = [];
  //   } else {
  //     // we are either on the library or the settings view
  //     // so let's play the whole library
  //     // Because the tracks in the store are not ordered, let's filter
  //     // and sort everything
  //     const { sort, search } = library;
  //     newQueue = library.tracks;

  //     newQueue = sortTracks(filterTracks(newQueue, search), SORT_ORDERS[sort.by][sort.order]);
  //   }
  // }

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
      const isFocused = await getCurrent().isFocused().catch(logAndNotifyError);

      if (track == null || !isEnabled || isFocused) {
        return;
      }

      // TODO: onclick focus the window
      // TODO: setup channel ID with icon
      // TODO: ensure album image is displayed
      sendNotification({
        title: track.title,
        body: `${track.artists.join(', ')}\n${track.album}`,
        icon: 'test',
        silent: true,
      });
    }

    // Bind player events
    // Audio Events
    player.getAudio().addEventListener('play', notifyTrackChange);
    player.getAudio().addEventListener('error', handleAudioError);
    player.getAudio().addEventListener('ended', playerAPI.next);

    return function cleanup() {
      player.getAudio().removeEventListener(' play', notifyTrackChange);
      player.getAudio().removeEventListener('ended', playerAPI.next);
      player.getAudio().removeEventListener('error', handleAudioError);
    };
  }, [libraryAPI, toastsAPI, playerAPI]);

  return null;
}

export default PlayerEvents;

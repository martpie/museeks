import { useEffect } from 'react';

import usePlayerStore from '../../stores/usePlayerStore';
import useToastsStore from '../../stores/useToastsStore';
import useLibraryStore from '../../stores/useLibraryStore';

const { player } = window.MuseeksAPI;

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

/**
 * Handle app-level IPC Events init and cleanup
 */
function PlayerEvents() {
  const playerAPI = usePlayerStore.getState().api;
  const libraryAPI = useLibraryStore.getState().api;
  const toastsAPI = useToastsStore.getState().api;

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

    function incrementPlayCount() {
      if (player.isThresholdReached()) {
        const track = player.getTrack();
        if (track) libraryAPI.incrementPlayCount(track._id);
      }
    }
    // Bind player events
    // Audio Events
    player.getAudio().addEventListener('ended', playerAPI.next);
    player.getAudio().addEventListener('error', handleAudioError);
    player.getAudio().addEventListener('timeupdate', incrementPlayCount);

    return function cleanup() {
      player.getAudio().removeEventListener('ended', playerAPI.next);
      player.getAudio().removeEventListener('error', handleAudioError);
      player.getAudio().removeEventListener('timeupdate', incrementPlayCount);
    };
  });

  return null;
}

export default PlayerEvents;

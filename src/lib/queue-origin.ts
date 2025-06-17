import type { NavigateFn } from '@tanstack/react-router';

import type { QueueOrigin } from '../types/museeks';

export function goToPlayingTrack(
  queueOrigin: QueueOrigin | null,
  navigate: NavigateFn,
) {
  if (!queueOrigin) return;

  switch (queueOrigin.type) {
    case 'library': {
      navigate({
        to: '/library',
        replace: true, // Force rerendering to activate the scroll
        search: {
          jump_to_playing_track: true,
        },
      });
      break;
    }
    case 'playlist': {
      navigate({
        to: '/playlists/$playlistID',
        params: { playlistID: queueOrigin.playlistID },
        replace: true,
        search: {
          jump_to_playing_track: true,
        },
      });
      break;
    }
    case 'artist': {
      navigate({
        to: '/artists/$artistID',
        params: { artistID: queueOrigin.artistID },
        replace: true,
        search: {
          jump_to_playing_track: true,
        },
      });
    }
  }
}

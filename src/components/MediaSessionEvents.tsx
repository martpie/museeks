import { useEffect } from 'react';

import { getCover } from '../lib/cover';
import player from '../lib/player';
import { usePlayerAPI } from '../stores/usePlayerStore';

/**
 * Integration for MediaSession (mpris, macOS player controls etc)...
 */
function MediaSessionEvents() {
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    if (
      'mediaSession' in navigator &&
      typeof navigator.mediaSession === 'object'
    ) {
      player.getAudio().addEventListener('loadstart', syncMediaSession);
      player.getAudio().addEventListener('play', onAudioPlay);
      player.getAudio().addEventListener('pause', onAudioPause);

      navigator.mediaSession.setActionHandler('play', () => playerAPI.play());
      navigator.mediaSession.setActionHandler('pause', () => playerAPI.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () =>
        playerAPI.previous(),
      );
      navigator.mediaSession.setActionHandler('nexttrack', () =>
        playerAPI.next(),
      );
    }

    return function cleanup() {
      if (
        'mediaSession' in navigator &&
        typeof navigator.mediaSession === 'object'
      ) {
        player.getAudio().removeEventListener('loadstart', syncMediaSession);
        player.getAudio().removeEventListener('play', onAudioPlay);
        player.getAudio().removeEventListener('pause', onAudioPause);

        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [playerAPI]);

  return null;
}

export default MediaSessionEvents;

/**
 * Helpers
 */

async function syncMediaSession() {
  const track = player.getTrack();

  if (track && 'MediaMetadata' in globalThis) {
    const cover = await getCover(track.path);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artists.join(', '),
      album: track.album,
      artwork: cover ? [{ src: cover }] : undefined,
    });
  }
}

function onAudioPlay() {
  navigator.mediaSession.playbackState = 'playing';
}

function onAudioPause() {
  navigator.mediaSession.playbackState = 'paused';
}

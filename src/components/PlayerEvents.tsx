import { useNavigate } from '@tanstack/react-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { useEffect } from 'react';

import config from '../lib/config';
import { getCover } from '../lib/cover';
import player from '../lib/player';
import { goToPlayingTrack } from '../lib/queue-origin';
import { logAndNotifyError } from '../lib/utils';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { useToastsAPI } from '../stores/useToastsStore';

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound:
    'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

/**
 * Handle some of the logic regarding the player. Technically, it should not be there,
 * but part of the Player library, but cleaning up events in case of hot-reload is tough
 */
function PlayerEvents() {
  const playerAPI = usePlayerAPI();
  const toastsAPI = useToastsAPI();
  const queueOrigin = usePlayerStore((state) => state.queueOrigin);
  const navigate = useNavigate();

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

    async function onTrackEnded() {
      await playerAPI.next();

      const isFocused = await getCurrentWindow().isFocused();

      // If follow track is enabled, switch to the right view + scroll to the track
      // Do not do it if the app if focused, as users could be interacting with the app
      if ((await config.get('audio_follow_playing_track')) && !isFocused) {
        goToPlayingTrack(queueOrigin, navigate);
      }
    }

    // Bind player events
    // Audio Events
    player.getAudio().addEventListener('play', notifyTrackChange);
    player.getAudio().addEventListener('error', handleAudioError);
    player.getAudio().addEventListener('ended', onTrackEnded);

    return function cleanup() {
      player.getAudio().removeEventListener('play', notifyTrackChange);
      player.getAudio().removeEventListener('error', handleAudioError);
      player.getAudio().removeEventListener('ended', onTrackEnded);
    };
  }, [toastsAPI, playerAPI, queueOrigin, navigate]);

  return null;
}

export default PlayerEvents;

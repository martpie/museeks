import { useNavigate } from '@tanstack/react-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { useEffect } from 'react';

import { usePlayerState } from '../hooks/usePlayer';
import ConfigBridge from '../lib/bridge-config';
import { getCover } from '../lib/cover';
import player from '../lib/player';
import { goToPlayingTrack } from '../lib/queue-origin';
import { logAndNotifyError } from '../lib/utils';
import { useToastsAPI } from '../stores/useToastsStore';

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound:
    'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

/**
 * Handle player events for notifications and error handling
 */
function PlayerEvents() {
  const toastsAPI = useToastsAPI();
  const queueOrigin = usePlayerState((state) => state.queueOrigin);
  const navigate = useNavigate();

  useEffect(() => {
    function handleAudioError(error: MediaError) {
      player.stop();

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

    async function notifyTrackChange() {
      const track = player.getTrack();
      const isEnabled = await ConfigBridge.get('notifications');
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
      const isFocused = await getCurrentWindow().isFocused();

      // If follow track is enabled, switch to the right view + scroll to the track
      // Do not do it if the app is focused, as users could be interacting with the app
      if (
        (await ConfigBridge.get('audio_follow_playing_track')) &&
        !isFocused
      ) {
        goToPlayingTrack(queueOrigin, navigate);
      }
    }

    // Bind player events
    player.on('play', notifyTrackChange);
    player.on('error', handleAudioError);
    player.on('ended', onTrackEnded);

    return function cleanup() {
      player.off('play', notifyTrackChange);
      player.off('error', handleAudioError);
      player.off('ended', onTrackEnded);
    };
  }, [toastsAPI, queueOrigin, navigate]);

  return null;
}

export default PlayerEvents;

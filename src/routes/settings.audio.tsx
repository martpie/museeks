import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AudioOutputSelect from '../components/AudioOutputSelect';
import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import SettingsAPI from '../stores/SettingsAPI';
import { usePlayerAPI } from '../stores/usePlayerStore';

export const Route = createFileRoute('/settings/audio')({
  component: ViewSettingsAudio,
});

function ViewSettingsAudio() {
  const { config } = useLoaderData({ from: '/settings' });

  const playerAPI = usePlayerAPI();
  const invalidate = useInvalidate();

  return (
    <div className="setting setting-audio">
      <Setting.Section>
        <Setting.Input
          label="Playback rate"
          description="Increase the playback rate: a value of 2 will play your music at a 2x
          speed"
          id="setting-playbackrate"
          value={config.audio_playback_rate ?? ''}
          onChange={(e) =>
            playerAPI
              .setPlaybackRate(Number.parseFloat(e.currentTarget.value))
              .then(invalidate)
          }
          type="number"
          min="0.5"
          max="5"
          step="0.1"
        />
      </Setting.Section>
      <Setting.Section>
        <AudioOutputSelect
          label="Audio output"
          description="Advanced: set a custom audio output device."
          id="setting-playbackrate"
          value={config.audio_output_device}
          onChange={useInvalidateCallback(playerAPI.setOutputDevice)}
        />
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="follow-playing-track"
          title="Follow playing track"
          description="Automatically follow the currently playing track (only when the app is not focused)"
          value={config.audio_follow_playing_track}
          onChange={useInvalidateCallback(SettingsAPI.toggleFollowPlayingTrack)}
        />
      </Setting.Section>
    </div>
  );
}

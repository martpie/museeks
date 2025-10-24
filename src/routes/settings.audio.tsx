import { useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import player from '../lib/player';
import SettingsAPI from '../stores/SettingsAPI';

export const Route = createFileRoute('/settings/audio')({
  component: ViewSettingsAudio,
});

function ViewSettingsAudio() {
  const { config } = useLoaderData({ from: '/settings' });

  const invalidate = useInvalidate();
  const { t } = useLingui();

  return (
    <>
      <Setting.Section>
        <Setting.Input
          label={t`Playback rate`}
          description={t`Increase the playback rate: a value of 2 will play your music at a 2x speed`}
          value={config.audio_playback_rate ?? ''}
          onChange={(e) =>
            player
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
        <CheckboxSetting
          title={t`Follow playing track`}
          description={t`Automatically follow the currently playing track (only when the app is not focused)`}
          value={config.audio_follow_playing_track}
          onChange={useInvalidateCallback(SettingsAPI.toggleFollowPlayingTrack)}
        />
      </Setting.Section>
    </>
  );
}

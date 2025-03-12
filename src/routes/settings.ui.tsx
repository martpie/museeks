import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import type { Config, DefaultView } from '../generated/typings';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import { themes } from '../lib/themes';
import SettingsAPI from '../stores/SettingsAPI';

export const Route = createFileRoute('/settings/ui')({
  component: ViewSettingsUI,
});

function ViewSettingsUI() {
  const { config } = useLoaderData({ from: '/settings' });

  const invalidate = useInvalidate();

  return (
    <div className="setting setting-interface">
      <Setting.Section>
        <Setting.Select
          label="Theme"
          description="Change the appearance of the interface"
          id="setting-theme"
          value={config.theme}
          onChange={(e) =>
            SettingsAPI.setTheme(e.currentTarget.value).then(invalidate)
          }
        >
          <option value="__system">System (default)</option>
          {Object.values(themes).map((theme) => {
            return (
              <option key={theme._id} value={theme._id}>
                {theme.name}
              </option>
            );
          })}
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label="Tracks density"
          description="Change the default view when starting the application"
          id="setting-tracks-density"
          value={config.track_view_density}
          onChange={(e) =>
            SettingsAPI.setTracksDensity(
              e.currentTarget.value as Config['track_view_density'],
            ).then(invalidate)
          }
        >
          <option value="normal">Normal (default)</option>
          <option value="compact">Compact</option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label="Default view"
          value={config.default_view}
          description="Change the default view when starting the application"
          id="setting-default-view"
          onChange={(e) =>
            SettingsAPI.setDefaultView(
              e.currentTarget.value as DefaultView,
            ).then(invalidate)
          }
        >
          <option value="Library">Library (default)</option>
          <option value="Playlists">Playlists</option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="native-notifications"
          title="Display Notifications"
          description="Send notifications when the playing track changes"
          value={config.notifications}
          onChange={useInvalidateCallback(
            SettingsAPI.toggleDisplayNotifications,
          )}
        />
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="sleepmode"
          title="Sleep mode blocker"
          description="Prevent the computer from going into sleep mode when playing"
          value={config.sleepblocker}
          onChange={useInvalidateCallback(SettingsAPI.toggleSleepBlocker)}
        />
      </Setting.Section>
    </div>
  );
}

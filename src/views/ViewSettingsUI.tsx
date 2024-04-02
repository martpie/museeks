import { useCallback, ChangeEventHandler } from 'react';
import { useLoaderData } from 'react-router-dom';

import SettingsAPI from '../stores/SettingsAPI';
import * as Setting from '../components/Setting/Setting';
import CheckboxSetting from '../components/SettingCheckbox/SettingCheckbox';
import { themes } from '../lib/themes';
import { Config, DefaultView } from '../generated/typings';

import { SettingsLoaderData } from './ViewSettings';

export default function ViewSettingsUI() {
  const { config } = useLoaderData() as SettingsLoaderData;

  const onThemeChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (e) => {
      SettingsAPI.setTheme(e.currentTarget.value);
    },
    [],
  );

  const onTracksDensityChange = useCallback<
    ChangeEventHandler<HTMLSelectElement>
  >((e) => {
    SettingsAPI.setTracksDensity(
      e.currentTarget.value as Config['track_view_density'],
    );
  }, []);

  const onDefaultViewChange = useCallback<
    ChangeEventHandler<HTMLSelectElement>
  >((e) => {
    SettingsAPI.setDefaultView(e.currentTarget.value as DefaultView);
  }, []);

  return (
    <div className="setting setting-interface">
      <Setting.Section>
        <Setting.Select
          label="Theme"
          description="Change the appearance of the interface"
          id="setting-theme"
          defaultValue={config.theme}
          onChange={onThemeChange}
          disabled // Issue in Tauri where we cannot easily detect system-wide preferences
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
          defaultValue={config.track_view_density}
          onChange={onTracksDensityChange}
        >
          <option value="normal">Normal (default)</option>
          <option value="compact">Compact</option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label="Default view"
          defaultValue={config.theme}
          description="Change the default view when starting the application"
          id="setting-default-view"
          onChange={onDefaultViewChange}
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
          defaultValue={config.notifications}
          onClick={SettingsAPI.toggleDisplayNotifications}
        />
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="sleepmode"
          title="Sleep mode blocker"
          description="Prevent the computer from going into sleep mode when playing"
          defaultValue={config.sleepblocker}
          onClick={SettingsAPI.toggleSleepBlocker}
        />
      </Setting.Section>
    </div>
  );
}

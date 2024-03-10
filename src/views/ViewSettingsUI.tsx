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
        <Setting.Label htmlFor="setting-theme">Theme</Setting.Label>
        <Setting.Select
          defaultValue={config.theme}
          onChange={onThemeChange}
          id="setting-theme"
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
        <Setting.Description>
          Change the appearance of the interface
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <Setting.Label htmlFor="setting-tracksDensity">
          Tracks density
        </Setting.Label>
        <Setting.Select
          defaultValue={config.track_view_density}
          onChange={onTracksDensityChange}
          id="setting-tracksDensity"
        >
          <option value="normal">Normal (default)</option>
          <option value="compact">Compact</option>
        </Setting.Select>
        <Setting.Description>
          Change the default view when starting the application
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <Setting.Label htmlFor="setting-default-view">
          Default view
        </Setting.Label>
        <Setting.Select
          defaultValue={config.theme}
          onChange={onDefaultViewChange}
          id="setting-default-view"
        >
          <option value="Library">Library (default)</option>
          <option value="Playlists">Playlists</option>
        </Setting.Select>
        <Setting.Description>
          Change the default view when starting the application
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="native-notifications"
          title="Display Notifications"
          description="Send notifications when the playing track changes"
          defaultValue={config.notifications}
          onClick={SettingsAPI.toggleDisplayNotifications}
        />
        <CheckboxSetting
          slug="sleepmode"
          title="Sleep mode blocker"
          description="Prevent the computer from going into sleep mode when playing"
          defaultValue={config.sleepblocker}
          onClick={SettingsAPI.toggleSleepBlocker}
        />
        <CheckboxSetting
          slug="update"
          title="Automatically check for updates"
          defaultValue={config.auto_update_checker}
          onClick={SettingsAPI.toggleAutoUpdateChecker}
        />
      </Setting.Section>
    </div>
  );
}

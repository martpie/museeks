import { useCallback, ChangeEventHandler } from 'react';
import { useLoaderData } from 'react-router-dom';

import SettingsAPI from '../../stores/SettingsAPI';
import * as Setting from '../../components/Setting/Setting';
import CheckboxSetting from '../../components/SettingCheckbox/SettingCheckbox';
import { themes } from '../../../shared/lib/themes';
import { Config } from '../../../shared/types/museeks';

import { SettingsLoaderData } from './Settings';

export default function SettingsUI() {
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
      e.currentTarget.value as Config['tracksDensity'],
    );
  }, []);

  const onDefaultViewChange = useCallback<
    ChangeEventHandler<HTMLSelectElement>
  >((e) => {
    SettingsAPI.setDefaultView(e.currentTarget.value);
  }, []);

  return (
    <div className="setting setting-interface">
      <Setting.Section>
        <Setting.Label htmlFor="setting-theme">Theme</Setting.Label>
        <Setting.Select
          defaultValue={config.theme}
          onChange={onThemeChange}
          id="setting-theme"
        >
          <option value="__system">System (default)</option>
          {themes.map((theme) => {
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
          defaultValue={config.tracksDensity}
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
          <option value="library">Library (default)</option>
          <option value="playlists">Playlists</option>
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
          defaultValue={config.displayNotifications}
          onClick={SettingsAPI.toggleDisplayNotifications}
        />
        <CheckboxSetting
          slug="sleepmode"
          title="Sleep mode blocker"
          description="Prevent the computer from going into sleep mode"
          defaultValue={config.sleepBlocker}
          onClick={SettingsAPI.toggleSleepBlocker}
        />
        <CheckboxSetting
          slug="update"
          title="Auto update checker"
          description="Automatically check for updates on startup"
          defaultValue={config.autoUpdateChecker}
          onClick={SettingsAPI.toggleAutoUpdateChecker}
        />
      </Setting.Section>
    </div>
  );
}

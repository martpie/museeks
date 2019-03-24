import * as React from 'react';
import * as os from 'os';

import * as SettingsActions from '../../actions/SettingsActions';

import CheckboxSetting from '../../components/SettingCheckbox/SettingCheckbox';
import { Config } from '../../../shared/types/interfaces';

interface Props {
  config: Config;
}

export default class SettingsUI extends React.Component<Props> {
  render () {
    const { config } = this.props;

    return (
      <div className='setting setting-interface'>
        <CheckboxSetting
          slug='dark-theme'
          title='Dark Theme'
          description='Enable dark theme'
          defaultValue={config.theme === 'dark'}
          onClick={SettingsActions.toggleDarkTheme}
        />
        <CheckboxSetting
          slug='native-notifications'
          title='Display Notifications'
          description='Allow the app to send native notifications'
          defaultValue={config.displayNotifications}
          onClick={SettingsActions.toggleDisplayNotifications}
        />
        <CheckboxSetting
          slug='sleepmode'
          title='Sleep mode blocker'
          description='Prevent the computer from going into sleep mode'
          defaultValue={config.sleepBlocker}
          onClick={SettingsActions.toggleSleepBlocker}
        />
        {os.platform() !== 'darwin' && (
          <CheckboxSetting
            slug='tray'
            title='Minimize to tray on close'
            description='Prevent the app from shutting down when clicking the "close" window button'
            defaultValue={config.minimizeToTray}
            onClick={SettingsActions.toggleMinimizeToTray}
          />
        )}
        <CheckboxSetting
          slug='update'
          title='Auto update checker'
          description='Automatically check for updates on startup'
          defaultValue={config.autoUpdateChecker}
          onClick={SettingsActions.toggleAutoUpdateChecker}
        />
      </div>
    );
  }
}

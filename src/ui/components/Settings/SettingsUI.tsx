import * as React from 'react';

import * as SettingsActions from '../../actions/SettingsActions';

import CheckboxSetting from './CheckboxSetting';
import { Config } from '../../typings/interfaces';

/*
|--------------------------------------------------------------------------
| Child - UI Settings
|--------------------------------------------------------------------------
*/

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
          slug='nativeframe'
          title='Use native frame'
          description='Run Museeks with default window controls (will restart the app)'
          defaultValue={config.useNativeFrame}
          onClick={SettingsActions.toggleNativeFrame}
        />
        <CheckboxSetting
          slug='sleepmode'
          title='Sleep mode blocker'
          description='Prevent the computer from going into sleep mode'
          defaultValue={config.sleepBlocker}
          onClick={SettingsActions.toggleSleepBlocker}
        />
        <CheckboxSetting
          slug='tray'
          title='Minimize on close'
          description='Minimize when closing the app'
          defaultValue={config.minimizeToTray}
          onClick={SettingsActions.toggleMinimizeToTray}
        />
        <CheckboxSetting
          slug='update'
          title='Auto update checker'
          description='Automatically check for update on startup'
          defaultValue={config.autoUpdateChecker}
          onClick={SettingsActions.toggleAutoUpdateChecker}
        />
      </div>
    );
  }
}

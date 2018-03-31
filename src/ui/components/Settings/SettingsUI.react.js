import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AppActions from '../../actions/AppActions';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - UI Settings
|--------------------------------------------------------------------------
*/

export default class SettingsUI extends Component {
  static propTypes = {
    config: PropTypes.object,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const config = this.props.config;

    return (
      <div className='setting setting-interface'>
        <CheckboxSetting
          title='Dark Theme'
          description='Enable dark theme'
          defaultValue={config.theme === 'dark'}
          onClick={AppActions.settings.toggleDarkTheme}
        />
        <CheckboxSetting
          title='Display Notifications'
          description='Allow the app to send native notifications'
          defaultValue={config.displayNotifications}
          onClick={AppActions.settings.toggleDisplayNotifications}
        />
        <CheckboxSetting
          title='Use native frame'
          description='Run Museeks with default window controls (will restart the app)'
          defaultValue={config.useNativeFrame}
          onClick={AppActions.settings.toggleNativeFrame}
        />
        <CheckboxSetting
          title='Sleep mode blocker'
          description='Prevent the computer from going into sleep mode'
          defaultValue={config.sleepBlocker}
          onClick={AppActions.settings.toggleSleepBlocker}
        />
        <CheckboxSetting
          title='Minimize on close'
          description='Minimize when closing the app'
          defaultValue={config.minimizeToTray}
          onClick={AppActions.settings.toggleMinimizeToTray}
        />
        <CheckboxSetting
          title='Auto update checker'
          description='Automatically check for update on startup'
          defaultValue={config.autoUpdateChecker}
          onClick={AppActions.settings.toggleAutoUpdateChecker}
        />
      </div>
    );
  }
}

import React, { Component } from 'react';

import { api, actions } from '../../library';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - UI Settings
|--------------------------------------------------------------------------
*/

export default class SettingsUI extends Component {

    static propTypes = {
        config: React.PropTypes.object
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
                    defaultValue={ config.theme === 'dark' }
                    onClick={ actions.settings.toggleDarkTheme }
                />
                <CheckboxSetting
                    title='Display Notifications'
                    description='When checked, native notifications will be displayed for various things, like track start'
                    defaultValue={ config.displayNotifications }
                    onClick={ actions.settings.toggleDisplayNotifications }
                />
                <CheckboxSetting
                    title='Use native frame'
                    description='Run Museeks with default window controls (will restart the app)'
                    defaultValue={ config.useNativeFrame }
                    onClick={ actions.settings.toggleNativeFrame }
                />
                <CheckboxSetting
                    title='Sleep mode blocker'
                    description='Prevent the computer from going into sleep mode'
                    defaultValue={ config.sleepBlocker }
                    onClick={ actions.settings.toggleSleepBlocker }
                />
                <CheckboxSetting
                    title='Minimize to tray'
                    description='Minimize to tray when closing the app'
                    defaultValue={ config.minimizeToTray }
                    onClick={ actions.settings.toggleMinimizeToTray }
                />
                <CheckboxSetting
                    title='Auto update checker'
                    description='Automatically check for update on startup'
                    defaultValue={ config.autoUpdateChecker }
                    onClick={ actions.settings.toggleAutoUpdateChecker }
                />
            </div>
        );
    }
}

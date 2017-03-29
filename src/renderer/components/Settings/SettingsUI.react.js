import React, { Component } from 'react';
import { connect } from 'react-redux';

import lib from '../../lib';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - UI Settings
|--------------------------------------------------------------------------
*/

class SettingsUI extends Component {

    static propTypes = {
        config: React.PropTypes.object,
        toggleDarkTheme: React.PropTypes.func,
        toggleNativeFrame: React.PropTypes.func,
        toggleDisplayNotifications: React.PropTypes.func,
        toggleMinimizeToTray: React.PropTypes.func,
        toggleSleepBlocker: React.PropTypes.func,
        toggleAutoUpdateChecker: React.PropTypes.func,
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
                    onClick={ this.props.toggleDarkTheme }
                />
                <CheckboxSetting
                    title='Display Notifications'
                    description='When checked, native notifications will be displayed for various things, like track start'
                    defaultValue={ config.displayNotifications }
                    onClick={ this.props.toggleDisplayNotifications }
                />
                <CheckboxSetting
                    title='Use native frame'
                    description='Run Museeks with default window controls (will restart the app)'
                    defaultValue={ config.useNativeFrame }
                    onClick={ this.props.toggleNativeFrame }
                />
                <CheckboxSetting
                    title='Sleep mode blocker'
                    description='Prevent the computer from going into sleep mode'
                    defaultValue={ config.sleepBlocker }
                    onClick={ this.props.toggleSleepBlocker }
                />
                <CheckboxSetting
                    title='Minimize to tray'
                    description='Minimize to tray when closing the app'
                    defaultValue={ config.minimizeToTray }
                    onClick={ this.props.toggleMinimizeToTray }
                />
                <CheckboxSetting
                    title='Auto update checker'
                    description='Automatically check for update on startup'
                    defaultValue={ config.autoUpdateChecker }
                    onClick={ this.props.toggleAutoUpdateChecker }
                />
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    toggleDarkTheme: lib.actions.settings.toggleDarkTheme,
    toggleDisplayNotifications: lib.actions.settings.toggleDisplayNotifications,
    toggleNativeFrame: lib.actions.settings.toggleNativeFrame,
    toggleSleepBlocker: lib.actions.settings.toggleSleepBlocker,
    toggleMinimizeToTray: lib.actions.settings.toggleMinimizeToTray,
    toggleAutoUpdateChecker: lib.actions.settings.toggleAutoUpdateChecker
};

export default connect(stateToProps, dispatchToProps)(SettingsUI);

import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Child - UI Settings
|--------------------------------------------------------------------------
*/

export default class SettingsUI extends Component {

    static propTypes = {
        config: React.PropTypes.object.isRequired
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        const config = this.props.config;

        // TODO (y.solovyov): seems repetitive, might be a good fit for separate component
        return (
            <div className='setting setting-interface'>
                <div className='setting-section'>
                    <h4>Theme</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ AppActions.settings.toggleDarkTheme } defaultChecked={ config.theme === 'dark' } /> Enable dark theme
                            </label>
                        </div>
                </div>
                <div className='setting-section'>
                    <h4>Use native frame</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ AppActions.settings.toggleNativeFrame } defaultChecked={ config.useNativeFrame } /> Run Museeks with default window controls (<strong>will restart the app</strong>)
                            </label>
                        </div>
                </div>
                <div className='setting-section'>
                    <h4>Sleep mode blocker</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ AppActions.settings.toggleSleepBlocker } defaultChecked={ config.sleepBlocker } /> Prevent the computer from going into sleep
                             mode
                            </label>
                        </div>
                </div>
                <div className='setting-section'>
                    <h4>Auto update checker</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ AppActions.settings.toggleAutoUpdateChecker } defaultChecked={ config.autoUpdateChecker } /> Automatically check for update on startup
                            </label>
                        </div>
                </div>
            </div>
        );
    }
}

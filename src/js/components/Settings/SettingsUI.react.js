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

        return (
            <div className='setting setting-theme-selector'>
                <div className='setting-section'>
                    <h4>Theme</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ this.switchTheme } defaultChecked={ config.theme === 'dark' } /> Enable dark theme
                            </label>
                        </div>
                </div>
                <div className='setting-section'>
                    <h4>Sleep mode</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ this.toggleSleepBlocker } defaultChecked={ config.sleepBlocker } /> Prevent the computer to go in sleep mode
                            </label>
                        </div>
                </div>
            </div>
        );
    }

    switchTheme() {
        AppActions.settings.toggleDarkTheme();
    }

    toggleSleepBlocker() {
        AppActions.settings.toggleSleepBlocker();
    }
}

import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| Child - ThemeSelector - manage theme
|--------------------------------------------------------------------------
*/

export default class ThemeSelector extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var config = this.props.config;

        return (
            <div className='setting setting-theme-selector'>
                <h4>Theme</h4>
                <div className='checkbox'>
                    <label>
                        <input type='checkbox' onClick={ this.switchTheme } defaultChecked={ config.theme === 'dark' } /> Enable dark theme
                    </label>
                </div>
                <h4>Sleep mode</h4>
                <div className='checkbox'>
                    <label>
                        <input type='checkbox' onClick={ this.toggleSleepBlocker } defaultChecked={ config.sleepBlocker } /> Prevent the computer to go in sleep mode
                    </label>
                </div>
            </div>
        );
    }

    switchTheme() {
        AppActions.settings.toggleDarkTheme();
    }

    toggleSleepBlocker() {
        AppActions.settings.toggleSleepBlocker('prevent-app-suspension');
    }
}

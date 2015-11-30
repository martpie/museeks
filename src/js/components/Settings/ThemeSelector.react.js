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

        return (
            <div className='setting setting-music-selector'>
                <h4>Theme</h4>
                <div className='checkbox'>
                    <label>
                        <input type='checkbox' onClick={ this.switchTheme } defaultChecked={ this.props.theme === 'dark' } ref='theme' /> Enable dark theme
                    </label>
                </div>
            </div>
        );
    }

    switchTheme() {
        AppActions.settings.toggleDarkTheme();
    }
}

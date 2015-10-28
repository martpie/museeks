import React, { Component } from 'react';



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
                        <input type='checkbox' onClick={ this.switchTheme.bind(this) } ref='theme' /> Enable dark theme
                    </label>
                </div>
            </div>
        );
    }

    switchTheme(e) {

        var self = this;

        var newTheme = this.refs.theme.checked ? 'dark' : 'light';

        var config = JSON.parse(localStorage.getItem('config'));

        document.querySelector('body').classList.remove('theme-' + config.theme);
        document.querySelector('body').classList.add('theme-' + newTheme);

        config.theme = newTheme;

        localStorage.setItem('config', JSON.stringify(config));
    }
}

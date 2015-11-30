import React, { Component } from 'react';



/*
|--------------------------------------------------------------------------
| Child - DevMode
|--------------------------------------------------------------------------
*/

export default class DevMode extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        return (
            <div className='setting setting-music-selector'>
                <h4>Dev mode</h4>
                <div className='checkbox'>
                    <label>
                        <input type='checkbox' onClick={ this.toggleDevMode.bind(this) } ref='devMode' /> Enable dev mode
                    </label>
                </div>
            </div>
        );
    }

    toggleDevMode() {

        // Move that to AppActions
        var self    = this;
        var devMode = this.refs.devMode.checked;
        var config  = JSON.parse(localStorage.getItem('config'));

        config.devMode = devMode;

        localStorage.setItem('config', JSON.stringify(config));
    }
}

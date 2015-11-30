import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';



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
                        <input type='checkbox' onClick={ this.toggleDevMode } checked={ this.props.devMode } ref='devMode' /> Enable dev mode
                    </label>
                </div>
            </div>
        );
    }

    toggleDevMode(e) {
        e.preventDefault();
        AppActions.settings.toggleDevMode();
    }
}

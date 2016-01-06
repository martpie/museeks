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

        var config = this.props.config;

        return (
            <div className='setting setting-dev-mode'>
                <div className='setting-section'>
                    <h4>Dev mode</h4>
                    <div className='checkbox'>
                        <label>
                            <input type='checkbox' onClick={ this.toggleDevMode } defaultChecked={ config.devMode } /> Enable dev mode
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    toggleDevMode() {
        AppActions.settings.toggleDevMode();
    }
}

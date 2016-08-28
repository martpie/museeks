import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Child - Advanced Settings
|--------------------------------------------------------------------------
*/

export default class SettingsAdvanced extends Component {

    static propTypes = {
        config: React.PropTypes.object.isRequired
    }

    constructor(props) {

        super(props);
    }

    render() {

        const config = this.props.config;

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

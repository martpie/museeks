import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';

import CheckboxSetting from './CheckboxSetting.react';


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
                <CheckboxSetting
                    title='Dev mode'
                    description='Enable dev mode'
                    defaultValue={ config.devMode }
                    onClick={ AppActions.settings.toggleDevMode }
                />
            </div>
        );
    }
}

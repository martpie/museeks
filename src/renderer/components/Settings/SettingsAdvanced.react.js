import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actions } from '../../lib';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - Advanced Settings
|--------------------------------------------------------------------------
*/

class SettingsAdvanced extends Component {

    static propTypes = {
        config: React.PropTypes.object
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
                    onClick={ this.props.toggleDevMode }
                />
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    toggleDevMode: actions.settings.toggleDevMode
};

export default connect(stateToProps, dispatchToProps)(SettingsAdvanced);

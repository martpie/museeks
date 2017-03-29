import React, { Component } from 'react';
import { connect } from 'react-redux';

import lib from '../../lib';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - Advanced Settings
|--------------------------------------------------------------------------
*/

class SettingsAdvanced extends Component {

    static propTypes = {
        config: React.PropTypes.object,
        toggleDevMode: React.PropTypes.func,
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
    toggleDevMode: lib.actions.settings.toggleDevMode
};

export default connect(stateToProps, dispatchToProps)(SettingsAdvanced);

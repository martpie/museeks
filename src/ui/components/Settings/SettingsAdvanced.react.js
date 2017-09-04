import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AppActions from '../../actions/AppActions';

import CheckboxSetting from './CheckboxSetting.react';


/*
|--------------------------------------------------------------------------
| Child - Advanced Settings
|--------------------------------------------------------------------------
*/

export default class SettingsAdvanced extends Component {
    static propTypes = {
      config: PropTypes.object,
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

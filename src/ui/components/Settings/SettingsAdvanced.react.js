import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as SettingsActions from '../../actions/SettingsActions';

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
          defaultValue={config.devMode}
          onClick={SettingsActions.toggleDevMode}
        />
      </div>
    );
  }
}

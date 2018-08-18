import React, { Component } from 'react';

import * as SettingsActions from '../../actions/SettingsActions';

import CheckboxSetting from './CheckboxSetting';
import { Config } from '../../typings/interfaces';


/*
|--------------------------------------------------------------------------
| Child - Advanced Settings
|--------------------------------------------------------------------------
*/

interface Props {
  config: Config;
}


export default class SettingsAdvanced extends Component<Props> {
  render() {
    const { config } = this.props;

    return (
      <div className="setting setting-dev-mode">
        <CheckboxSetting
          slug="devmode"
          title="Dev mode"
          description="Enable dev mode"
          defaultValue={config.devMode}
          onClick={SettingsActions.toggleDevMode}
        />
      </div>
    );
  }
}

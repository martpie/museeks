import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as PlayerActions from '../../actions/PlayerActions';


/*
|--------------------------------------------------------------------------
| Child - Audio settings
|--------------------------------------------------------------------------
*/

export default class SettingsAudio extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
  }

  setPlaybackRate(e) {
    PlayerActions.setPlaybackRate(e.currentTarget.value);
  }

  render() {
    const { config } = this.props;

    return (
      <div className="setting setting-audio">
        <div className="setting-section">
          <h4>Playback rate</h4>
          <div className="formGroup">
            <label htmlFor="setting-playbackrate">
              Increase the playback rate: a value of 2 will play your music at a 2x speed
              <input
                className="form-control"
                id="setting-playbackrate"
                defaultValue={config.audioPlaybackRate}
                onChange={this.setPlaybackRate}
                type="number"
                min="0.5"
                max="5"
                step="0.1"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }
}

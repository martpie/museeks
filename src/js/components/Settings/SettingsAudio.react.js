import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| Child - Audio settings
|--------------------------------------------------------------------------
*/

export default class SettingsAudio extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let config = this.props.config;

        return (
            <div className='setting setting-audio'>
                <div className='setting-section'>
                    <h4>Playback rate</h4>
                    <div className='formGroup'>
                        <label>
                            Increase the playback rate: a value of 2 will play your music at a 2x speed
                        </label>
                        <input type='number' className='form-control' defaultValue={config.audioPlaybackRate} onChange={this.setPlaybackRate} min='0.1' max='10' step='0.1' />
                    </div>
                </div>
            </div>
        );
    }

    setPlaybackRate(e) {

        AppActions.player.setPlaybackRate(e.currentTarget.value);
    }
}

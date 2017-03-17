import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actions } from '../../lib';


/*
|--------------------------------------------------------------------------
| Child - Audio settings
|--------------------------------------------------------------------------
*/

class SettingsAudio extends Component {

    static propTypes = {
        config: React.PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        const config = this.props.config;

        return (
            <div className='setting setting-audio'>
                <div className='setting-section'>
                    <h4>Playback rate</h4>
                    <div className='formGroup'>
                        <label>
                            Increase the playback rate: a value of 2 will play your music at a 2x speed
                        </label>
                        <input type='number'
                               className='form-control'
                               defaultValue={ config.audioPlaybackRate }
                               onChange={ this.setPlaybackRate }
                               min='0.5'
                               max='5'
                               step='0.1'
                        />
                    </div>
                </div>
            </div>
        );
    }

    setPlaybackRate = (e) => {
        this.props.setPlaybackRate(e.currentTarget.value);
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    setPlaybackRate: actions.player.setPlaybackRate
};

export default connect(stateToProps, dispatchToProps)(SettingsAudio);

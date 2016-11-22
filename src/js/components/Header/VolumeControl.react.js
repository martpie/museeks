import React, { Component } from 'react';
import Icon from 'react-fontawesome';
import classnames from 'classnames';

import AppActions from '../../actions/AppActions';
import Player from '../../lib/player';

/*
|--------------------------------------------------------------------------
| VolumeControl
|--------------------------------------------------------------------------
*/

export default class VolumeControl extends Component {

    constructor(props) {

        super(props);

        const audio = Player.getAudio();

        this.state = {
            showVolume : false,
            volume     : Math.pow(audio.volume, 1 / 4),
            muted      : audio.muted
        };

        this.mute       = this.mute.bind(this);
        this.showVolume = this.showVolume.bind(this);
        this.hideVolume = this.hideVolume.bind(this);
        this.setVolume  = this.setVolume.bind(this);
    }

    getVolumeIcon(volume, muted) {
        return muted || volume === 0 ? 'volume-off' : Math.pow(volume, 1 / 4) > 0.5 ? 'volume-up' : 'volume-down';
    }

    render() {

        const volumeClasses = classnames('volume-control', {
            visible: this.state.showVolume
        });

        return (
            <button type='button'
                    className='player-control volume'
                    onMouseEnter={ this.showVolume }
                    onMouseLeave={ this.hideVolume }
                    onClick={ this.mute }
            >
                <Icon name={ this.getVolumeIcon(this.state.volume, this.state.muted) } />
                <div className={ volumeClasses }>
                    <input type={ 'range' }
                           min={ 0 }
                           max={ 1 }
                           step={ 0.01 }
                           defaultValue={ this.state.volume }
                           ref='volume'
                           onChange={ this.setVolume }
                    />
                </div>
            </button>
        );
    }

    setVolume(e) {

        const smoothVolume = Math.pow(e.currentTarget.value, 4);

        AppActions.player.setVolume(smoothVolume);
        this.setState({ volume: smoothVolume });
    }

    showVolume() {
        this.setState({ showVolume: true });
    }

    hideVolume() {
        this.setState({ showVolume: false });
    }

    mute(e) {

        if(e.target.classList.contains('player-control') || e.target.classList.contains('fa')) {

            const muted = !Player.getAudio().muted;

            AppActions.player.setMuted(muted);
            this.setState({ muted });
        }
    }
}

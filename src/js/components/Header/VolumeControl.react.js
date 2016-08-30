import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';
import classnames from 'classnames';

import AppActions from '../../actions/AppActions';
import Player from '../../lib/player';

/*
|--------------------------------------------------------------------------
| VolumeControl
|--------------------------------------------------------------------------
*/

export default class VolumeControl extends PureComponent {

    static propTypes = {
        audio: React.PropTypes.object
    }

    constructor(props) {

        super(props);

        this.state = {
            showVolume : false
        };

        this.mute       = this.mute.bind(this);
        this.showVolume = this.showVolume.bind(this);
        this.hideVolume = this.hideVolume.bind(this);
    }

    getVolumeIcon(audio) {
        return audio.muted || audio.volume === 0 ? 'volume-off' : audio.volume > 0.5 ? 'volume-up' : 'volume-down';
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
                <Icon name={ this.getVolumeIcon(this.props.audio) } />
                <div className={ volumeClasses }>
                    <input type={ 'range' }
                           min={ 0 }
                           max={ 1 }
                           step={ 0.01 }
                           defaultValue={ Math.pow(this.props.audio.volume, 1 / 4) }
                           ref='volume'
                           onChange={ this.setVolume }
                    />
                </div>
            </button>
        );
    }

    setVolume(e) {
        AppActions.player.setVolume(parseFloat(e.currentTarget.value));
    }

    showVolume() {
        this.setState({ showVolume: true });
    }

    hideVolume() {
        this.setState({ showVolume: false });
    }

    mute(e) {

        if(e.target.classList.contains('player-control') || e.target.classList.contains('fa')) {

            AppActions.player.setMuted(!Player.getAudio().muted);
        }
    }
}

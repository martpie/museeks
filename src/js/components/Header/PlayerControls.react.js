import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl.react';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| Player controls
|--------------------------------------------------------------------------
*/

export default class PlayerControls extends PureComponent {

    static propTypes = {
        audio: React.PropTypes.object,
        playerStatus: React.PropTypes.string
    }

    render() {
        return (
            <div className='player-controls'>
                <button type='button' className='player-control previous' onClick={ this.previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ this.playToggle.bind(this) }>
                    <Icon name={ this.props.playerStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ this.next }>
                    <Icon name='forward' />
                </button>
                <VolumeControl
                    audio={ this.props.audio }
                />
            </div>
        );

    }

    playToggle() {
        if(this.props.playerStatus === 'play') this.pause();
        else if (this.props.playerStatus === 'pause') this.play();
    }

    play() {
        AppActions.player.play();
    }

    pause() {
        AppActions.player.pause();
    }

    next() {
        AppActions.player.next();
    }

    previous() {
        AppActions.player.previous();
    }

}

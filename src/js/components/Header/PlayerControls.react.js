import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';

import VolumeControl from './VolumeControl.react';

/*
|--------------------------------------------------------------------------
| Player controls
|--------------------------------------------------------------------------
*/

export default class PlayerControls extends PureComponent {

    static propTypes = {
        previous: React.PropTypes.func,
        next: React.PropTypes.func,
        playToggle: React.PropTypes.func,
        playerStatus: React.PropTypes.string
    }

    render() {
        return (
            <div className='player-controls'>
                <button type='button' className='player-control previous' onClick={ this.props.previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ this.props.playToggle }>
                    <Icon name={ this.props.playerStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ this.props.next }>
                    <Icon name='forward' />
                </button>
                <VolumeControl
                    { ...this.props }
                />
            </div>
        );

    }

}

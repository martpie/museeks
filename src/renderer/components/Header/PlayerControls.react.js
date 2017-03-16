import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl.react';

import { api, actions } from '../../lib';

/*
|--------------------------------------------------------------------------
| PlayerControls
|--------------------------------------------------------------------------
*/

export default class PlayerControls extends PureComponent {

    static propTypes = {
        playerStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='player-controls'>
                <button type='button' className='player-control previous' onClick={ actions.player.previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ actions.player.playToggle }>
                    <Icon name={ this.props.playerStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ actions.player.next }>
                    <Icon name='forward' />
                </button>
                <VolumeControl />
            </div>
        );
    }
}

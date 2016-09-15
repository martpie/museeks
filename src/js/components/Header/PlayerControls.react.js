import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl.react';

import AppActions from '../../actions/AppActions';

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
                <button type='button' className='player-control previous' onClick={ AppActions.player.previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ AppActions.player.playToggle }>
                    <Icon name={ this.props.playerStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ AppActions.player.next }>
                    <Icon name='forward' />
                </button>
                <VolumeControl />
            </div>
        );

    }
}

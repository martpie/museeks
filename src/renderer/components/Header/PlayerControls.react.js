import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl.react';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| PlayerControls
|--------------------------------------------------------------------------
*/

class PlayerControls extends PureComponent {

    static propTypes = {
        playerStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    render = () => {
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
                <VolumeControl />
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    previous: lib.actions.player.previous,
    next: lib.actions.player.next,
    playToggle: lib.actions.player.playToggle
};

export default connect(stateToProps, dispatchToProps)(PlayerControls);

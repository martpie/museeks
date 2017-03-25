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
        playStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    next = () => this.props.next()
    previous = () => this.props.previous()
    playToggle = () => this.props.Toggle()

    render() {
        return (
            <div className='player-controls'>
                <button type='button' className='player-control previous' onClick={ this.previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ this.playToggle }>
                    <Icon name={ this.props.playStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ this.next }>
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

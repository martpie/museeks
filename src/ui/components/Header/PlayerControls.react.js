import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl.react';

import * as PlayerActions from '../../actions/PlayerActions';

/*
|--------------------------------------------------------------------------
| PlayerControls
|--------------------------------------------------------------------------
*/

export default class PlayerControls extends PureComponent {
  static propTypes = {
    playerStatus: PropTypes.string,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='player-controls'>
        <button
          type='button'
          className='player-control previous'
          title='Previous'
          onClick={PlayerActions.previous}
        >
          <Icon name='backward' />
        </button>
        <button
          className='player-control play'
          title={this.props.playerStatus === 'play' ? 'Pause' : 'Play'}
          onClick={PlayerActions.playToggle}
        >
          <Icon name={this.props.playerStatus === 'play' ? 'pause' : 'play'} fixedWidth />
        </button>
        <button
          type='button'
          className='player-control forward'
          title='Next'
          onClick={PlayerActions.next}
        >
          <Icon name='forward' />
        </button>
        <VolumeControl />
      </div>
    );
  }
}

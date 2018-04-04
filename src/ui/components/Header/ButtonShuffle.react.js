import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InlineSVG from 'react-svg-inline';
import classnames from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';


/*
|--------------------------------------------------------------------------
| ShuffleButton
|--------------------------------------------------------------------------
*/

export default class ButtonShuffle extends Component {
  static propTypes = {
    shuffle: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.toggleShuffle = this.toggleShuffle.bind(this);
  }

  toggleShuffle() {
    PlayerActions.shuffle(!this.props.shuffle);
  }

  render() {
    const svg = require('../../../images/icons/player-shuffle.svg');

    const buttonClasses = classnames('button', {
      active: this.props.shuffle,
    });

    return (
      <button type='button' className={buttonClasses} onClick={this.toggleShuffle}>
        <InlineSVG svg={svg} className='icon shuffle' />
      </button>
    );
  }
}

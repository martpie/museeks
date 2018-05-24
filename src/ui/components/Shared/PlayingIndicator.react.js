import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import { connect } from 'react-redux';

import classnames from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';


/*
|--------------------------------------------------------------------------
| PlayingIndicator
|--------------------------------------------------------------------------
*/

class TrackPlayingIndicator extends Component {
  static propTypes = {
    state: PropTypes.string.isRequired,
  }

  static getIcon = (state, hovered) => {
    if (state === 'play') {
      if (hovered) {
        return <Icon name="pause" fixedWidth />;
      }

      return (
        <div className="animation">
          <div className="bar bar-first" />
          <div className="bar bar-second" />
          <div className="bar bar-third" />
        </div>
      );
    }

    return <Icon name="play" fixedWidth />;
  }

  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
    };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter() {
    this.setState({ hovered: true });
  }

  onMouseLeave() {
    this.setState({ hovered: false });
  }

  render() {
    const classNames = classnames('playing-indicator', 'reset', this.props.state, {
      hovered: this.state.hovered,
    });

    const icon = TrackPlayingIndicator.getIcon(this.props.state, this.state.hovered);

    return (
      <button
        className={classNames}
        onClick={PlayerActions.playPause}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        tabIndex="0"
      >
        <div className="playing-indicator">
          { icon }
        </div>
      </button>
    );
  }
}


const mapStateToProps = state => ({ state: state.player.playerStatus });

export default connect(mapStateToProps)(TrackPlayingIndicator);

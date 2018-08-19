import * as React from 'react';
import * as Icon from 'react-fontawesome';
import { connect } from 'react-redux';

import classnames from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';
import { PlayerStatus } from '../../typings/interfaces';
import { RootState } from '../../reducers';

/*
|--------------------------------------------------------------------------
| PlayingIndicator
|--------------------------------------------------------------------------
*/

interface Props {
  state: PlayerStatus;
}

interface State {
  hovered: boolean;
}

class TrackPlayingIndicator extends React.Component<Props, State> {
  static getIcon = (state: PlayerStatus, hovered: boolean) => {
    if (state === PlayerStatus.PLAY) {
      if (hovered) {
        return <Icon name='pause' fixedWidth />;
      }

      return (
        <div className='animation'>
          <div className='bar bar-first' />
          <div className='bar bar-second' />
          <div className='bar bar-third' />
        </div>
      );
    }

    return <Icon name='play' fixedWidth />;
  }

  constructor (props: Props) {
    super(props);
    this.state = {
      hovered: false
    };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter () {
    this.setState({ hovered: true });
  }

  onMouseLeave () {
    this.setState({ hovered: false });
  }

  render () {
    const classNames = classnames('playing-indicator', 'reset', this.props.state, {
      hovered: this.state.hovered
    });

    const icon = TrackPlayingIndicator.getIcon(this.props.state, this.state.hovered);

    return (
      <button
        className={classNames}
        onClick={PlayerActions.playPause}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        tabIndex={0}
      >
        <div className='playing-indicator'>
          { icon }
        </div>
      </button>
    );
  }
}

const mapStateToProps = (state: RootState): Props => ({ state: state.player.playerStatus });

export default connect(mapStateToProps)(TrackPlayingIndicator);

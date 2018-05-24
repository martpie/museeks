import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import PlayingIndicator from './PlayingIndicator.react';
import { parseDuration } from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| TrackRow
|--------------------------------------------------------------------------
*/

export default class TrackRow extends PureComponent {
  static propTypes = {
    selected: PropTypes.bool,
    track: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool,
    onDoubleClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
  }

  static defaultProps = {
    selected: false,
    isPlaying: false,
    onDoubleClick: () => {},
    onMouseDown: () => {},
    onContextMenu: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onMouseDown(e) {
    this.props.onMouseDown(e, this.props.track._id, this.props.index);
  }

  onContextMenu(e) {
    this.props.onContextMenu(e, this.props.index);
  }

  onDoubleClick() {
    this.props.onDoubleClick(this.props.track._id);
  }

  render() {
    const { track, selected } = this.props;
    const trackClasses = classnames('track', {
      selected,
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
        role="option"
        aria-selected={selected}
        tabIndex="-1" // we do not want trackrows to be focusable by the keyboard
      >
        <div className="cell cell-track-playing text-center">
          {this.props.isPlaying ? <PlayingIndicator /> : null}
        </div>
        <div className="cell cell-track">
          { track.title }
        </div>
        <div className="cell cell-duration">
          { parseDuration(track.duration) }
        </div>
        <div className="cell cell-artist">
          { track.artist[0] }
        </div>
        <div className="cell cell-album">
          { track.album }
        </div>
        <div className="cell cell-genre">
          { track.genre.join(', ') }
        </div>
      </div>
    );
  }
}

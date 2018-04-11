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
    children: PropTypes.array,
    selected: PropTypes.bool,
    track: PropTypes.object,
    index: PropTypes.number,
    isPlaying: PropTypes.bool,
    onDoubleClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onMouseDown   = this.onMouseDown.bind(this);
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

  getPlayingIndicator(props) {
    if (props.isPlaying) {
      return <PlayingIndicator />;
    }

    return null;
  }

  render() {
    const { track } = this.props;
    const trackClasses = classnames('track', {
      selected: this.props.selected,
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
      >
        <div className='cell cell-track-playing text-center'>
          {this.getPlayingIndicator(this.props)}
        </div>
        <div className='cell cell-track'>
          { track.title }
        </div>
        <div className='cell cell-duration'>
          { parseDuration(track.duration) }
        </div>
        <div className='cell cell-artist'>
          { track.artist[0] }
        </div>
        <div className='cell cell-album'>
          { track.album }
        </div>
        <div className='cell cell-genre'>
          { track.genre.join(', ') }
        </div>
      </div>
    );
  }
}

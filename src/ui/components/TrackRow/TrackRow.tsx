import * as React from 'react';
import cx from 'classnames';

import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import { parseDuration } from '../../utils/utils';
import { TrackModel } from '../../../shared/types/interfaces';

import * as styles from './TrackRow.css';
import * as cellStyles from '../TracksListHeader/TracksListHeader.css';

/*
|--------------------------------------------------------------------------
| TrackRow
|--------------------------------------------------------------------------
*/

interface Props {
  selected: boolean;
  track: TrackModel;
  index: number;
  isPlaying: boolean;
  onDoubleClick: Function;
  onMouseDown: Function;
  onContextMenu: Function;
}

export default class TrackRow extends React.PureComponent<Props> {
  constructor (props: Props) {
    super(props);

    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
  }

  onMouseDown (e: React.SyntheticEvent) {
    this.props.onMouseDown(e, this.props.track._id, this.props.index);
  }

  onContextMenu (e: React.SyntheticEvent) {
    this.props.onContextMenu(e, this.props.index);
  }

  onDoubleClick () {
    this.props.onDoubleClick(this.props.track._id);
  }

  render () {
    const { track, selected } = this.props;
    const trackClasses = cx(styles.track, {
      [styles.selected]: selected,
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
        role='option'
        aria-selected={selected}
        tabIndex={-1} // we do not want trackrows to be focusable by the keyboard
      >
        <div className={`${styles.cell} ${cellStyles.cellTrackPlaying} text-center`}>
          {this.props.isPlaying ? <PlayingIndicator /> : null}
        </div>
        <div className={`${styles.cell} ${cellStyles.cellTrack}`}>
          { track.title }
        </div>
        <div className={`${styles.cell} ${cellStyles.cellDuration}`}>
          { parseDuration(track.duration) }
        </div>
        <div className={`${styles.cell} ${cellStyles.cellArtist}`}>
          { track.artist[0] }
        </div>
        <div className={`${styles.cell} ${cellStyles.cellAlbum}`}>
          { track.album }
        </div>
        <div className={`${styles.cell} ${cellStyles.cellGenre}`}>
          { track.genre.join(', ') }
        </div>
      </div>
    );
  }
}

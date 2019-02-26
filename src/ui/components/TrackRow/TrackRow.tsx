import * as React from 'react';
import cx from 'classnames';

import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import { parseDuration } from '../../utils/utils';
import { TrackModel } from '../../../shared/types/interfaces';

import * as styles from './TrackRow.css';
import * as cellStyles from '../TracksListHeader/TracksListHeader.css';

interface Props {
  selected: boolean;
  track: TrackModel;
  index: number;
  isPlaying: boolean;
  onDoubleClick: (trackId: string) => void;
  onMouseDown: (event: React.MouseEvent, trackId: string, index: number) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => void;
  onClick: (event: React.MouseEvent, trackId: string) => void;

  draggable?: boolean;
  reordered?: boolean;
  onDragStart?: () => void;
  onDragOver?: (trackId: string, position: 'above' | 'below') => void ;
  onDragEnd?: () => void ;
  onDrop?: (targetTrackId: string, position: 'above' | 'below') => void;
}

interface State {
  reorderOver: boolean;
  reorderPosition: 'above' | 'below' | null;
}

export default class TrackRow extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      reorderOver: false,
      reorderPosition: null
    };
  }

  onMouseDown = (e: React.MouseEvent) => {
    this.props.onMouseDown(e, this.props.track._id, this.props.index);
  }

  onClick = (e: React.MouseEvent) => {
    this.props.onClick(e, this.props.track._id);
  }

  onContextMenu = (e: React.MouseEvent) => {
    this.props.onContextMenu(e, this.props.index);
  }

  onDoubleClick = () => {
    this.props.onDoubleClick(this.props.track._id);
  }

  onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const { onDragStart } = this.props;

    if (onDragStart) {
      event.dataTransfer.setData('text/plain', this.props.track._id);
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';

      onDragStart();
    }
  }

  onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const relativePosition = event.nativeEvent.offsetY / event.currentTarget.offsetHeight;
    const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

    this.setState({
      reorderOver: true,
      reorderPosition: dragPosition
    });
  }

  onDragLeave = (_event: React.DragEvent<HTMLDivElement>) => {
    this.setState({
      reorderOver: false,
      reorderPosition: null
    });
  }

  onDrop = (_event: React.DragEvent<HTMLDivElement>) => {
    const { reorderPosition } = this.state;
    const { onDrop } = this.props;

    if (reorderPosition && onDrop) {
      onDrop(this.props.track._id, reorderPosition);
    }

    this.setState({
      reorderOver: false,
      reorderPosition: null
    });
  }

  render () {
    const { track, selected, reordered, draggable } = this.props;
    const { reorderOver, reorderPosition } = this.state;

    const trackClasses = cx(styles.track, {
      [styles.selected]: selected,
      [styles.reordered]: reordered,
      [styles.isReorderedOver]: reorderOver,
      [styles.isAbove]: reorderPosition === 'above',
      [styles.isBelow]: reorderPosition === 'below'
    });

    return (
      <div
        className={trackClasses}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        role='option'
        aria-selected={selected}
        tabIndex={-1} // we do not want trackrows to be focusable by the keyboard

        draggable={draggable}
        onDragStart={(draggable && this.onDragStart) || undefined}
        onDragOver={(draggable && this.onDragOver) || undefined}
        onDragLeave={(draggable && this.onDragLeave) || undefined}
        onDrop={(draggable && this.onDrop) || undefined}
        onDragEnd={(draggable && this.props.onDragEnd) || undefined}
      >
        <div className={`${styles.cell} ${cellStyles.cellTrackPlaying}`}>
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

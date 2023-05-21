import React, { useCallback, useState } from 'react';
import cx from 'classnames';

import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import { parseDuration } from '../../lib/utils';
import { TrackModel } from '../../../shared/types/museeks';
import cellStyles from '../TracksListHeader/TracksListHeader.module.css';

import styles from './TrackRow.module.css';

type Props = {
  selected: boolean;
  track: TrackModel;
  index: number;
  isPlaying: boolean;
  onDoubleClick: (trackId: string) => void;
  onMouseDown: (event: React.MouseEvent, trackId: string, index: number) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => void;
  onClick: (event: React.MouseEvent | React.KeyboardEvent, trackId: string) => void;

  draggable?: boolean;
  reordered?: boolean;
  onDragStart?: () => void;
  onDragOver?: (trackId: string, position: 'above' | 'below') => void;
  onDragEnd?: () => void;
  onDrop?: (targetTrackId: string, position: 'above' | 'below') => void;
};

function TrackRow(props: Props) {
  const [reorderOver, setReorderOver] = useState(false);
  const [reorderPosition, setReorderPosition] = useState<'above' | 'below' | null>(null);

  const { track, index, selected, draggable, reordered, onMouseDown, onClick, onContextMenu, onDoubleClick } = props;

  // TODO: migrate to react-dnd
  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (props.onDragStart) {
        event.dataTransfer.setData('text/plain', props.track._id);
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';

        props.onDragStart();
      }
    },
    [props]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const relativePosition = event.nativeEvent.offsetY / event.currentTarget.offsetHeight;
    const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

    setReorderOver(true);
    setReorderPosition(dragPosition);
  }, []);

  const onDragLeave = useCallback((_event: React.DragEvent<HTMLDivElement>) => {
    setReorderOver(false);
    setReorderPosition(null);
  }, []);

  const onDrop = useCallback(
    (_event: React.DragEvent<HTMLDivElement>) => {
      const { onDrop } = props;

      if (reorderPosition && onDrop) {
        onDrop(props.track._id, reorderPosition);
      }

      setReorderOver(false);
      setReorderPosition(null);
    },
    [props, reorderPosition]
  );

  const trackClasses = cx(styles.track, {
    [styles.selected]: selected,
    [styles.reordered]: reordered,
    [styles.isReorderedOver]: reorderOver,
    [styles.isAbove]: reorderPosition === 'above',
    [styles.isBelow]: reorderPosition === 'below',
  });

  return (
    <div
      className={trackClasses}
      onDoubleClick={() => onDoubleClick(props.track._id)}
      onMouseDown={(e) => onMouseDown(e, track._id, index)}
      onClick={(e) => onClick(e, props.track._id)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onClick(e, track._id);
        }
      }}
      onContextMenu={(e) => onContextMenu(e, index)}
      role='option'
      aria-selected={selected}
      tabIndex={-1} // we do not want trackrows to be focusable by the keyboard
      draggable={draggable}
      onDragStart={(draggable && onDragStart) || undefined}
      onDragOver={(draggable && onDragOver) || undefined}
      onDragLeave={(draggable && onDragLeave) || undefined}
      onDrop={(draggable && onDrop) || undefined}
      onDragEnd={(draggable && props.onDragEnd) || undefined}
      {...(props.isPlaying ? { 'data-is-playing': true } : {})}
    >
      <div className={`${styles.cell} ${cellStyles.cellTrackPlaying}`}>
        {props.isPlaying ? <PlayingIndicator /> : null}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellTrack}`}>{track.title}</div>
      <div className={`${styles.cell} ${cellStyles.cellDuration}`}>{parseDuration(track.duration)}</div>
      <div className={`${styles.cell} ${cellStyles.cellArtist}`}>{track.artist.sort().join(', ')}</div>
      <div className={`${styles.cell} ${cellStyles.cellAlbum}`}>{track.album}</div>
      <div className={`${styles.cell} ${cellStyles.cellGenre}`}>{track.genre.join(', ')}</div>
    </div>
  );
}

export default TrackRow;

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cx from 'classnames';
import type React from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import PlayingIndicator from './PlayingIndicator';

import styles from './TrackRow.module.css';
import cellStyles from './TracksListHeader.module.css';

type Props = {
  selected: boolean;
  track: Track;
  index: number;
  isPlaying?: boolean;
  onDoubleClick?: (trackID: string) => void;
  onMouseDown?: (
    event: React.MouseEvent,
    trackID: string,
    index: number,
  ) => void;
  onContextMenu?: (event: React.MouseEvent, index: number) => void;
  onClick?: (
    event: React.MouseEvent | React.KeyboardEvent,
    trackID: string,
  ) => void;
  draggable?: boolean;
  style?: React.CSSProperties;
};

export default function TrackRow(props: Props) {
  const {
    track,
    index,
    selected,
    draggable,
    onMouseDown,
    onClick,
    onContextMenu,
    onDoubleClick,
  } = props;

  const duration = useFormattedDuration(track.duration);

  // Drag-and-Drop for playlists
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.track.id,
    disabled: !draggable,
    data: {
      type: 'playlist-track',
      index,
    },
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: 2,
        visibility: isDragging ? 'hidden' : 'visible',
      }
    : undefined;

  const trackClasses = cx(styles.track, {
    [styles.selected]: selected,
    [styles.even]: index % 2 === 0,
  });

  return (
    <div
      className={trackClasses}
      onDoubleClick={() => onDoubleClick?.(props.track.id)}
      onMouseDown={(e) => onMouseDown?.(e, track.id, index)}
      onClick={(e) => onClick?.(e, props.track.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick?.(e, track.id);
        }
      }}
      onContextMenu={(e) => onContextMenu?.(e, index)}
      aria-selected={selected}
      {...(props.isPlaying ? { 'data-is-playing': true } : {})}
      // dnd-related props:
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ ...style, ...props.style }} // memo that
    >
      <div className={`${styles.cell} ${cellStyles.cellTrackPlaying}`}>
        {props.isPlaying ? <PlayingIndicator /> : null}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellTrack}`}>
        {track.title}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellDuration}`}>
        {duration}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellArtist}`}>
        {track.artists.join(', ')}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellAlbum}`}>
        {track.album}
      </div>
      <div className={`${styles.cell} ${cellStyles.cellGenre}`}>
        {track.genres.join(', ')}
      </div>
    </div>
  );
}

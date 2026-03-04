import { useSortable } from '@dnd-kit/sortable';
import * as stylex from '@stylexjs/stylex';
import type React from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import PlayingIndicator from './PlayingIndicator';

export type TrackRowEvents = {
  onTrackSelect: (
    event: React.MouseEvent,
    trackID: string,
    trackIndex: number,
  ) => void;
  onContextMenu: (
    event: React.MouseEvent,
    trackID: string,
    trackIndex: number,
  ) => void;
  onPlaybackStart: (trackID: string) => void;
};

type Props = {
  selected: boolean;
  hasSelectedAbove?: boolean;
  track: Track;
  index: number;
  isPlaying?: boolean;
  draggable?: boolean;
  simplified?: boolean;
  style?: React.CSSProperties;
} & TrackRowEvents;

export default function TrackRow(props: Props) {
  const {
    track,
    index,
    selected,
    draggable,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;

  const duration = useFormattedDuration(track.duration);

  // Drag-and-Drop for playlists
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    isOver,
    activeIndex,
    overIndex,
  } = useSortable({
    id: props.track.id,
    disabled: !draggable,
    data: {
      type: 'playlist-track',
      index,
    },
  });

  return (
    // oxlint-disable-next-line jsx_a11y/click-events-have-key-events - given by ...listeners
    <li
      onDoubleClick={() => onPlaybackStart(track.id)}
      onMouseDown={(e) => onTrackSelect(e, track.id, index)}
      onClick={(e) => onTrackSelect(e, track.id, index)}
      onContextMenu={(e) => onContextMenu(e, track.id, index)}
      aria-selected={selected}
      {...(props.isPlaying ? { 'data-is-playing': true } : {})}
      // dnd-related props:
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={props.style}
      data-track-id={track.id}
      data-testid={`track-row-${track.id}`}
      aria-disabled="false"
      role="option" // technically already given by attributes, but that'll make the linter happy
      {...stylex.props(
        styles.track,
        index % 2 === 0 && styles.even,
        selected && styles.selected,
        selected && props.hasSelectedAbove && styles.selectedAfterSelected,
        isDragging && styles.isDragging,
        isOver && !isDragging && styles.isOver,
        isOver && overIndex < activeIndex && styles.isAbove,
        isOver && overIndex > activeIndex && styles.isBelow,
      )}
    >
      <div {...stylex.props(styles.cell, cellStyles.cellTrackPlaying)}>
        {props.isPlaying ? <PlayingIndicator /> : null}
      </div>
      <div {...stylex.props(styles.cell, cellStyles.cellTrack)}>
        {track.title}
      </div>
      <div
        {...stylex.props(
          styles.cell,
          cellStyles.cellDuration,
          props.simplified === true && styles.lastCellInSimplified,
        )}
      >
        {duration}
      </div>
      {props.simplified !== true && (
        <>
          <div {...stylex.props(styles.cell, cellStyles.cellArtist)}>
            {track.artists.join(', ')}
          </div>
          <div {...stylex.props(styles.cell, cellStyles.cellAlbum)}>
            {track.album}
          </div>
          <div {...stylex.props(styles.cell, cellStyles.cellGenre)}>
            {track.genres.join(', ')}
          </div>
        </>
      )}
    </li>
  );
}

const styles = stylex.create({
  cell: {
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    paddingRight: '4px',
    paddingLeft: '4px',
    cursor: 'default',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '24px',
  },
  track: {
    position: 'relative',
    display: 'flex',
    outline: 'none',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    backgroundColor: 'var(--tracks-bg-even)',
    alignItems: 'center',
  },
  even: {
    backgroundColor: 'var(--tracks-bg-odd)',
  },
  selected: {
    backgroundColor: 'var(--active-item-bg)',
    color: 'var(--active-item-color)',
  },
  selectedAfterSelected: {
    borderTopColor: 'rgba(255 255 255 / 0.2)',
  },
  isDragging: {
    opacity: 0.5,
  },
  isOver: {
    '::after': {
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
      display: 'block',
      width: '100%',
      content: '""',
      height: '2px',
      backgroundColor: 'var(--main-color)',
    },
  },
  isAbove: {
    '::after': {
      top: '-1px',
    },
  },
  isBelow: {
    '::after': {
      bottom: '-1px',
    },
  },
  lastCellInSimplified: {
    textAlign: 'right',
    paddingRight: '8px',
  },
});

const cellStyles = stylex.create({
  cellTrackPlaying: {
    width: '30px',
  },
  cellTrack: {
    flex: '1',
  },
  cellDuration: {
    width: '7%',
    minWidth: '70px',
  },
  cellArtist: {
    width: '20%',
  },
  cellAlbum: {
    width: '20%',
  },
  cellGenre: {
    width: '20%',
  },
});

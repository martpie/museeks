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
  showArtistInTitle?: boolean;
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
    isDragging, // is this item being dragged around
    isOver, // is this item being dragged over by another item
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

  const isEvenRow = index % 2 === 0;
  const isSelectedWithSelectedAbove =
    selected && props.hasSelectedAbove === true;
  const isDropIndicatorVisible = isOver && !isDragging;
  const isDropAbove = isOver && overIndex < activeIndex;
  const isDropBelow = isOver && overIndex > activeIndex;

  return (
    // oxlint-disable-next-line jsx_a11y/click-events-have-key-events - given by ...listeners
    <li
      onDoubleClick={() => onPlaybackStart(track.id)}
      onMouseDown={(e) => onTrackSelect(e, track.id, index)}
      onClick={(e) => onTrackSelect(e, track.id, index)}
      onContextMenu={(e) => onContextMenu(e, track.id, index)}
      data-is-playing={props.isPlaying === true}
      data-track-id={track.id}
      data-testid={`track-row-${track.id}`}
      // dnd-related props:
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // accessibility
      aria-disabled="false" // required
      aria-selected={selected}
      role="option" // technically already given by attributes, but that'll make the linter happy
      // styles
      {...stylex.props(
        trackStyles.track,
        isEvenRow && trackStyles.trackEvenRow,
        selected && trackStyles.trackSelected,
        isSelectedWithSelectedAbove && trackStyles.selectedWithSelectedAbove,
        isDragging && trackStyles.isDragging,
        isDropIndicatorVisible && trackStyles.isDraggedOver,
        isDropAbove && trackStyles.isDraggedOverAbove,
        isDropBelow && trackStyles.isDraggedOverBelow,
      )}
      style={props.style}
    >
      <div {...stylex.props(cellStyles.cell, cellStyles.trackPlaying)}>
        {props.isPlaying ? <PlayingIndicator /> : null}
      </div>
      <div {...stylex.props(cellStyles.cell, cellStyles.title)}>
        {track.title}
        {props.showArtistInTitle === true && track.artists.length > 0 && (
          <span {...stylex.props(trackStyles.artistInTitle)}>
            {'— '}
            {track.artists.join(', ')}
          </span>
        )}
      </div>
      <div
        {...stylex.props(
          cellStyles.cell,
          cellStyles.duration,
          props.simplified === true && cellStyles.rightAligned,
        )}
      >
        {duration}
      </div>
      {props.simplified !== true && (
        <>
          <div {...stylex.props(cellStyles.cell, cellStyles.artist)}>
            {track.artists.join(', ')}
          </div>
          <div {...stylex.props(cellStyles.cell, cellStyles.album)}>
            {track.album}
          </div>
          <div {...stylex.props(cellStyles.cell, cellStyles.genre)}>
            {track.genres.join(', ')}
          </div>
        </>
      )}
    </li>
  );
}

const trackStyles = stylex.create({
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
  trackEvenRow: {
    backgroundColor: 'var(--tracks-bg-odd)',
  },
  trackSelected: {
    backgroundColor: 'var(--active-item-bg)',
    color: 'var(--active-item-color)',
  },
  selectedWithSelectedAbove: {
    borderTopColor: 'rgba(255 255 255 / 0.2)',
  },
  isDragging: {
    opacity: 0.5,
  },
  isDraggedOver: {
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
  isDraggedOverAbove: {
    '::after': {
      top: '-1px',
    },
  },
  isDraggedOverBelow: {
    '::after': {
      bottom: '-1px',
    },
  },
  artistInTitle: {
    color: 'var(--text-muted)',
    fontSize: '0.85em',
    marginLeft: '4px',
  },
});

const cellStyles = stylex.create({
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
  trackPlaying: {
    width: '30px',
  },
  title: {
    flex: '1',
    display: 'flex',
    alignItems: 'baseline',
  },
  duration: {
    width: '7%',
    minWidth: '70px',
  },
  artist: {
    width: '20%',
  },
  album: {
    width: '20%',
  },
  genre: {
    width: '20%',
  },
  rightAligned: {
    textAlign: 'right',
    paddingRight: '8px',
  },
});

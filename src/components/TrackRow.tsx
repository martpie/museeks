import { useSortable } from '@dnd-kit/sortable';
import cx from 'classnames';
import type React from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import PlayingIndicator from './PlayingIndicator';
import cellStyles from './TrackListHeader.module.css';
import styles from './TrackRow.module.css';

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

  const trackClasses = cx(styles.track, {
    [styles.selected]: selected,
    [styles.even]: index % 2 === 0,
    [styles.isDragging]: isDragging,
    [styles.isOver]: isOver,
    [styles.isAbove]: isOver && overIndex < activeIndex,
    [styles.isBelow]: isOver && overIndex > activeIndex,
    [styles.simplified]: props.simplified,
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: later, make a <li>
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: later, make a listitem
    <div
      className={trackClasses}
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
      {props.simplified !== true && (
        <>
          <div className={`${styles.cell} ${cellStyles.cellArtist}`}>
            {track.artists.join(', ')}
          </div>
          <div className={`${styles.cell} ${cellStyles.cellAlbum}`}>
            {track.album}
          </div>
          <div className={`${styles.cell} ${cellStyles.cellGenre}`}>
            {track.genres.join(', ')}
          </div>
        </>
      )}
    </div>
  );
}

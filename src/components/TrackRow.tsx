import cx from 'classnames';
import type React from 'react';
import { useCallback, useState } from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import PlayingIndicator from './PlayingIndicator';
import styles from './TrackRow.module.css';
import cellStyles from './TracksListHeader.module.css';

type Props = {
  selected: boolean;
  track: Track;
  index: number;
  isPlaying: boolean;
  onDoubleClick: (trackID: string) => void;
  onMouseDown: (
    event: React.MouseEvent,
    trackID: string,
    index: number,
  ) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => void;
  onClick: (
    event: React.MouseEvent | React.KeyboardEvent,
    trackID: string,
  ) => void;

  draggable?: boolean;
  reordered?: boolean;
  onDragStart?: () => void;
  onDragOver?: (trackID: string, position: 'above' | 'below') => void;
  onDragEnd?: () => void;
  onDrop?: (targetTrackID: string, position: 'above' | 'below') => void;
  style?: React.CSSProperties;
};

export default function TrackRow(props: Props) {
  const [reorderOver, setReorderOver] = useState(false);
  const [reorderPosition, setReorderPosition] = useState<
    'above' | 'below' | null
  >(null);

  const {
    track,
    index,
    selected,
    draggable,
    reordered,
    onMouseDown,
    onClick,
    onContextMenu,
    onDoubleClick,
  } = props;

  const duration = useFormattedDuration(track.duration);

  // TODO: migrate to react-dnd
  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (props.onDragStart) {
        event.dataTransfer.setData('text/plain', props.track.id);
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';

        props.onDragStart();
      }
    },
    [props],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const relativePosition =
      event.nativeEvent.offsetY / event.currentTarget.offsetHeight;
    const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

    setReorderOver(true);
    setReorderPosition(dragPosition);
  }, []);

  const onDragLeave = useCallback(() => {
    setReorderOver(false);
    setReorderPosition(null);
  }, []);

  const onDrop = useCallback(() => {
    const { onDrop } = props;

    if (reorderPosition && onDrop) {
      onDrop(props.track.id, reorderPosition);
    }

    setReorderOver(false);
    setReorderPosition(null);
  }, [props, reorderPosition]);

  const trackClasses = cx(styles.track, {
    [styles.selected]: selected,
    [styles.reordered]: reordered,
    [styles.isReorderedOver]: reorderOver,
    [styles.isAbove]: reorderPosition === 'above',
    [styles.isBelow]: reorderPosition === 'below',
    [styles.even]: index % 2 === 0,
  });

  return (
    <div
      className={trackClasses}
      onDoubleClick={() => onDoubleClick(props.track.id)}
      onMouseDown={(e) => onMouseDown(e, track.id, index)}
      onClick={(e) => onClick(e, props.track.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick(e, track.id);
        }
      }}
      onContextMenu={(e) => onContextMenu(e, index)}
      // biome-ignore lint/a11y/useSemanticElements: Accessibility over semantics
      role="option"
      aria-selected={selected}
      tabIndex={-1} // we do not want trackrows to be focusable by the keyboard
      draggable={draggable}
      onDragStart={(draggable && onDragStart) || undefined}
      onDragOver={(draggable && onDragOver) || undefined}
      onDragLeave={(draggable && onDragLeave) || undefined}
      onDrop={(draggable && onDrop) || undefined}
      onDragEnd={(draggable && props.onDragEnd) || undefined}
      style={props.style}
      {...(props.isPlaying ? { 'data-is-playing': true } : {})}
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

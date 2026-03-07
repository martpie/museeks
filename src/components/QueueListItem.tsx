import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as stylex from '@stylexjs/stylex';
import { useCallback } from 'react';

import type { Track } from '../generated/typings';
import player from '../lib/player';
import Cover from './Cover';

type Props = {
  index: number;
  track: Track;
  queueCursor: number;
};

export default function QueueListItem(props: Props) {
  const { track } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: track.id,
      data: {
        type: 'queue-track',
      },
    });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const remove = useCallback(() => {
    player.removeFromQueue(props.index);
  }, [props.index]);

  const play = useCallback(async () => {
    await player.startFromQueue(props.queueCursor + props.index + 1);
  }, [props.index, props.queueCursor]);

  return (
    <li
      sx={[
        styles.queueItem,
        props.index > 0 && styles.queueItemWithTopBorder,
        stylex.defaultMarker(),
      ]}
      {...attributes}
      // DnD props for re-ordering
      ref={setNodeRef}
      style={itemStyle}
      onDoubleClick={play}
      {...listeners}
    >
      <div sx={styles.queueItemCover}>
        <Cover track={track} iconSize={12} />
      </div>
      <div sx={styles.queueItemInfo}>
        <div sx={styles.queueItemInfoTitle}>{track.title}</div>
        <div sx={styles.queueItemInfoOtherInfos}>
          <span>{track.artists.join(', ')}</span> - <span>{track.album}</span>
        </div>
      </div>
      <button type="button" sx={styles.queueItemRemove} onClick={remove}>
        &times;
      </button>
    </li>
  );
}

const styles = stylex.create({
  queueItem: {
    display: 'flex',
    flexWrap: 'nowrap',
    width: '100%',
    position: 'relative',
    cursor: 'pointer',
    alignItems: 'center',
  },
  queueItemWithTopBorder: {
    borderTopWidth: '1px',
    borderTopStyle: 'dashed',
    borderTopColor: 'var(--border-color)',
  },
  queueItemCover: {
    margin: '8px',
    width: '32px',
    aspectRatio: '1',
    borderRadius: '3px',
    overflow: 'hidden',
    fontSize: '16px',
  },
  queueItemInfo: {
    flex: '1',
    minWidth: 0,
  },
  queueItemInfoTitle: {
    fontWeight: 'bold',
    marginBottom: '4px',
    paddingRight: '10px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  queueItemInfoOtherInfos: {
    paddingRight: '10px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 0.7,
    fontSize: '0.875rem',
  },
  queueItemRemove: {
    color: 'var(--text-color)',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    width: '25px',
    height: '25px',
    lineHeight: '10px',
    padding: '3px',
    marginRight: '5px',
    visibility: {
      default: 'hidden',
      [stylex.when.ancestor(':hover')]: 'visible',
    },
    fontSize: '14px',
    textDecoration: 'none',
  },
});

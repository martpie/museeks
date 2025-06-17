import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback } from 'react';
import type { Track } from '../generated/typings';
import { usePlayerAPI } from '../stores/usePlayerStore';
import Cover from './Cover';
import styles from './QueueListItem.module.css';

type Props = {
  index: number;
  track: Track;
  queueCursor: number;
};

export default function QueueListItem(props: Props) {
  const playerAPI = usePlayerAPI();

  const { track } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: track.id,
      data: {
        type: 'queue-track',
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const remove = useCallback(() => {
    playerAPI.removeFromQueue(props.index);
  }, [props.index, playerAPI]);

  const play = useCallback(() => {
    playerAPI.startFromQueue(props.queueCursor + props.index + 1);
  }, [props.index, props.queueCursor, playerAPI]);

  return (
    <div
      className={styles.queueItem}
      // DnD props for re-ordering
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className={styles.queueItemCover}>
        <Cover track={track} />
      </div>
      {/** biome-ignore lint/a11y/noStaticElementInteractions: later, make a <li> */}
      <div className={styles.queueItemInfo} onDoubleClick={play}>
        <div className={styles.queueItemInfoTitle}>{track.title}</div>
        <div className={styles.queueItemInfoOtherInfos}>
          <span>{track.artists.join(', ')}</span> - <span>{track.album}</span>
        </div>
      </div>
      <button type="button" className={styles.queueItemRemove} onClick={remove}>
        &times;
      </button>
    </div>
  );
}

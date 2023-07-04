import React, { useCallback, useState } from 'react';

import QueueListItem from '../QueueListItem/QueueListItem';
import { getStatus } from '../../lib/utils-library';
import { TrackModel } from '../../../shared/types/museeks';
import Button from '../../elements/Button/Button';
import { usePlayerAPI } from '../../stores/usePlayerStore';

import styles from './QueueList.module.css';

const INITIAL_QUEUE_SIZE = 20;

type Props = {
  queue: TrackModel[];
  queueCursor: number;
};

export default function QueueList(props: Props) {
  const playerAPI = usePlayerAPI();

  const [draggedTrackIndex, setDraggedTrackIndex] = useState<number | null>(
    null,
  );
  const [draggedOverTrackIndex, setDraggedOverTrackIndex] = useState<
    number | null
  >(null);
  const [dragPosition, setDragPosition] = useState<null | 'above' | 'below'>(
    null,
  );

  const dragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.dataTransfer.setData('text/html', props.queue[index]._id);
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';

      setDraggedTrackIndex(index);
    },
    [props.queue],
  );

  const dragEnd = useCallback(() => {
    // Move that to a reducer may be a good idea

    const { queue, queueCursor } = props;

    const draggedIndex = draggedTrackIndex;
    const draggedOverIndex = draggedOverTrackIndex;

    if (draggedIndex !== null && draggedOverIndex !== null) {
      const offsetPosition = dragPosition === 'below' ? 1 : 0;
      const offsetHigherIndex =
        draggedOverIndex < draggedIndex ||
        (draggedOverIndex === draggedIndex && dragPosition === 'above')
          ? 1
          : 0;

      // Real position in queue
      const draggedQueueIndex = draggedIndex + queueCursor + 1;
      const draggedOverQueueIndex =
        draggedOverIndex + queueCursor + offsetPosition + offsetHigherIndex;

      const newQueue = [...queue];

      // remove draggedTrackIndex
      const movedTrack = newQueue.splice(draggedQueueIndex, 1)[0];

      // add removed track at its new position
      newQueue.splice(draggedOverQueueIndex, 0, movedTrack);

      setDraggedTrackIndex(null);
      setDraggedOverTrackIndex(null);
      setDragPosition(null);

      playerAPI.setQueue(newQueue);
    }
  }, [
    dragPosition,
    draggedOverTrackIndex,
    draggedTrackIndex,
    props,
    playerAPI,
  ]);

  const dragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();

      const relativePosition =
        e.nativeEvent.offsetY / e.currentTarget.offsetHeight;
      const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

      setDraggedOverTrackIndex(index);
      setDragPosition(dragPosition);
    },
    [],
  );

  const { queue, queueCursor } = props;
  const [queueSize, setQueueSize] = useState(INITIAL_QUEUE_SIZE);

  // Get the 20 next tracks displayed
  const shownQueue = queue.slice(queueCursor + 1, queueCursor + 1 + queueSize);
  const hiddenQueue = queue.slice(queueCursor + 1 + queueSize);
  const incomingQueue = queue.slice(queueCursor + 1);

  return (
    <>
      <div className={styles.queue__header}>
        <div className={styles.queue__header__infos}>
          {getStatus(incomingQueue)}
        </div>
        <Button bSize="small" onClick={playerAPI.clearQueue}>
          clear queue
        </Button>
      </div>
      <div className={styles.queue__content}>
        {shownQueue.map((track, index) => (
          <QueueListItem
            key={`track-${track._id}-${index}`}
            index={index}
            track={track}
            queueCursor={props.queueCursor}
            dragged={index === draggedTrackIndex}
            draggedOver={index === draggedOverTrackIndex}
            dragPosition={index === draggedOverTrackIndex ? dragPosition : null}
            onDragStart={dragStart}
            onDragOver={dragOver}
            onDragEnd={dragEnd}
          />
        ))}
        {hiddenQueue.length > 0 && (
          <Button
            block
            onClick={() =>
              setQueueSize(
                Math.min(queueSize + INITIAL_QUEUE_SIZE, incomingQueue.length),
              )
            }
          >
            See more
          </Button>
        )}
      </div>
    </>
  );
}

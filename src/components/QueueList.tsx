import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useState } from 'react';

import Button from '../elements/Button';
import type { Track } from '../generated/typings';
import { getStatus } from '../lib/utils-library';
import { usePlayerAPI } from '../stores/usePlayerStore';
import QueueListItem from './QueueListItem';

import styles from './QueueList.module.css';

const INITIAL_QUEUE_SIZE = 20;
const DND_MODIFIERS = [restrictToVerticalAxis];

type Props = {
  queue: Track[];
  queueCursor: number;
};

export default function QueueList(props: Props) {
  const { queue, queueCursor } = props;
  const [queueSize, setQueueSize] = useState(INITIAL_QUEUE_SIZE);

  const playerAPI = usePlayerAPI();

  // Get the 20 next tracks displayed
  const shownQueue = queue.slice(queueCursor + 1, queueCursor + 1 + queueSize);
  const hiddenQueue = queue.slice(queueCursor + 1 + queueSize);
  const incomingQueue = queue.slice(queueCursor + 1);

  // Drag-and-Drop support for reordering the queue
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {
        active, // dragged item
        over, // on which item it was dropped
      } = event;

      // The item was dropped either nowhere, or on the same item
      if (over == null || active.id === over.id) {
        return;
      }

      const activeIndex = queue.findIndex((track) => track.id === active.id);
      const overIndex = queue.findIndex((track) => track.id === over.id);

      const newQueue = [...queue];

      const movedTrack = newQueue.splice(activeIndex, 1)[0]; // Remove active track
      newQueue.splice(overIndex, 0, movedTrack); // Move it to where the user dropped it

      playerAPI.setQueue(newQueue);
    },
    [queue, playerAPI],
  );

  return (
    <DndContext onDragEnd={onDragEnd} id="dnd-queue" modifiers={DND_MODIFIERS}>
      <div className={styles.queueHeader}>
        <div className={styles.queueHeaderInfos}>
          {getStatus(incomingQueue)}
        </div>
        <Button bSize="small" onClick={playerAPI.clearQueue}>
          clear queue
        </Button>
      </div>
      <div className={styles.queueContent}>
        <SortableContext
          items={shownQueue}
          strategy={verticalListSortingStrategy}
        >
          {shownQueue.map((track, index) => (
            <QueueListItem
              key={`track-${track.id}-${index}`}
              index={index}
              track={track}
              queueCursor={props.queueCursor}
            />
          ))}
        </SortableContext>
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
    </DndContext>
  );
}

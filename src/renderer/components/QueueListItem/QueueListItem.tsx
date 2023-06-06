import React, { useCallback } from 'react';
import cx from 'classnames';

import { TrackModel } from '../../../shared/types/museeks';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './QueueListItem.module.css';

type Props = {
  dragged: boolean;
  draggedOver: boolean;
  dragPosition?: null | 'above' | 'below';
  index: number;
  track: TrackModel;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: React.DragEventHandler;
  queueCursor: number;
};

export default function QueueListItem(props: Props) {
  const playerAPI = usePlayerStore((state) => state.api);

  const { track } = props;

  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      props.onDragStart(e, props.index);
    },
    [props]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      props.onDragOver(e, props.index);
    },
    [props]
  );

  const remove = useCallback(() => {
    playerAPI.removeFromQueue(props.index);
  }, [props.index, playerAPI]);

  const play = useCallback(() => {
    playerAPI.startFromQueue(props.queueCursor + props.index + 1);
  }, [props.index, props.queueCursor, playerAPI]);

  const queueContentClasses = cx(styles.queue__item, {
    [styles.isDragged]: props.dragged,
    [styles.isDraggedOver]: props.draggedOver,
    [styles.isAbove]: props.draggedOver && props.dragPosition === 'above',
    [styles.isBelow]: props.draggedOver && props.dragPosition === 'below',
  });

  return (
    <div
      className={queueContentClasses}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={props.onDragEnd}
    >
      <div className={styles.queue__item__info} onDoubleClick={play}>
        <div className={styles.queue__item__info__title}>{track.title}</div>
        <div className={styles.queue__item__info__otherInfos}>
          <span>{track.artist}</span> - <span>{track.album}</span>
        </div>
      </div>
      <button className={styles.queue__item__remove} onClick={remove}>
        &times;
      </button>
    </div>
  );
}

import React, { useCallback } from 'react';
import cx from 'classnames';

import * as QueueActions from '../../store/actions/QueueActions';
import { TrackModel } from '../../../shared/types/museeks';

import styles from './QueueListItem.module.css';

interface Props {
  dragged: boolean;
  draggedOver: boolean;
  dragPosition?: null | 'above' | 'below';
  index: number;
  track: TrackModel;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: React.DragEventHandler;
  queueCursor: number;
}

const QueueListItem: React.FC<Props> = (props) => {
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
    QueueActions.remove(props.index);
  }, [props.index]);

  const play = useCallback(() => {
    QueueActions.start(props.queueCursor + props.index + 1);
  }, [props.index, props.queueCursor]);

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
};

export default QueueListItem;

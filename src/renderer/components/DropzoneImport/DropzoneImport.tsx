import React, { useCallback, useState } from 'react';

import styles from './DropzoneImport.module.css';

interface Props {
  title: string;
  subtitle: string;
  shown: boolean;
  // onDrop: (e: DragEvent) => void;
  // onClick: (e?: React.SyntheticEvent<HTMLDivElement>) => void;
}

enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
  DRAGGED_OVER = 'draggedOver',
}

const DropzoneImport: React.FC<Props> = (props) => {
  // const [dragState, setDragState] = useState(DragState.IDLE);

  // const onKeyDown = useCallback(
  //   (e: React.KeyboardEvent<HTMLDivElement>) => {
  //     e.persist();
  //     e.stopPropagation();
  //     e.nativeEvent.stopImmediatePropagation();

  //     switch (e.nativeEvent.code) {
  //       case 'Space': {
  //         props.onClick();
  //         break;
  //       }
  //       default: {
  //         break;
  //       }
  //     }
  //   },
  //   [props]
  // );

  // const onDragEnter = useCallback(() => {
  //   setDragState(DragState.DRAGGING);
  // }, []);

  // const onDragLeave = useCallback(() => {
  //   setDragState(DragState.IDLE);
  // }, []);

  // const onDragOver = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => {
  //   setDragState(DragState.DRAGGED_OVER);
  //   e.preventDefault();
  // }, []);

  // const onDrop = useCallback(
  //   (e: React.SyntheticEvent<HTMLDivElement>) => {
  //     e.preventDefault();
  //     setDragState(DragState.IDLE);
  //     if (props.onDrop) props.onDrop(e.nativeEvent as DragEvent);
  //   },
  //   [props]
  // );

  return (
    <div
      // className={`${styles.dropzone} ${dragState === DragState.DRAGGED_OVER ? styles.dropzoneDraggedOver : ''}`}
      className={`${styles.dropzone} ${props.shown && styles.shown}`}
      // onDragEnter={onDragEnter}
      // onDragOver={onDragOver}
      // onDragLeave={onDragLeave}
      // onDrop={onDrop}
      // onClick={props.onClick}
      // onKeyDown={onKeyDown}
      // role='button'
      // tabIndex={0}
    >
      <div className={styles.dropzone__title}>{props.title}</div>
      <div className={styles.dropzone__subtitle}>{props.subtitle}</div>
    </div>
  );
};

export default DropzoneImport;

import * as React from 'react';
import cx from 'classnames';

import * as QueueActions from '../../actions/QueueActions';
import { TrackModel } from '../../../shared/types/interfaces';

import * as styles from './QueueListItem.css';

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

export default class QueueListItem extends React.PureComponent<Props> {
  static defaultProps = {
    dragPosition: null
  };

  constructor (props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.play = this.play.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
  }

  onDragStart (e: React.DragEvent<HTMLDivElement>) {
    this.props.onDragStart(e, this.props.index);
  }

  onDragOver (e: React.DragEvent<HTMLDivElement>) {
    this.props.onDragOver(e, this.props.index);
  }

  remove () {
    QueueActions.remove(this.props.index);
  }

  async play () {
    await QueueActions.start(this.props.queueCursor + this.props.index + 1);
  }

  render () {
    const queueContentClasses = cx(styles.queue__item, {
      [styles.isDragged]: this.props.dragged,
      [styles.isDraggedOver]: this.props.draggedOver,
      [styles.isAbove]: this.props.draggedOver && this.props.dragPosition === 'above',
      [styles.isBelow]: this.props.draggedOver && this.props.dragPosition === 'below'
    });

    const { track } = this.props;

    return (
      <div
        className={queueContentClasses}
        draggable={true}
        onDragStart={this.onDragStart}
        onDragOver={this.onDragOver}
        onDragEnd={this.props.onDragEnd}
      >
        <div className={styles.queue__item__info} onDoubleClick={this.play} >
          <div className={styles.queue__item__info__title}>
            { track.title }
          </div>
          <div className={styles.queue__item__info__otherInfos}>
            <span>{ track.artist }</span> - <span>{ track.album }</span>
          </div>
        </div>
        <button
          className={styles.queue__item__remove}
          onClick={this.remove}
        >
          &times;
        </button>
      </div>
    );
  }
}

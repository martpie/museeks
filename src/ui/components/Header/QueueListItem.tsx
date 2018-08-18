import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';

import * as QueueActions from '../../actions/QueueActions';
import { TrackModel } from '../../typings/interfaces';

/*
|--------------------------------------------------------------------------
| QueueItem
|--------------------------------------------------------------------------
*/

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

export default class QueueListItem extends PureComponent<Props> {
  static defaultProps = {
    dragPosition: null,
  }

  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.play = this.play.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
  }

  onDragStart(e: React.DragEvent<HTMLDivElement>) {
    this.props.onDragStart(e, this.props.index);
  }

  onDragOver(e: React.DragEvent<HTMLDivElement>) {
    this.props.onDragOver(e, this.props.index);
  }

  remove() {
    QueueActions.remove(this.props.index);
  }

  play() {
    QueueActions.start(this.props.queueCursor + this.props.index + 1);
  }

  render() {
    const queueContentClasses = classnames('track', {
      dragged: this.props.dragged,
      'dragged-over': this.props.draggedOver,
      above: this.props.draggedOver && this.props.dragPosition === 'above',
      below: this.props.draggedOver && this.props.dragPosition === 'below',
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
        <div className="track-infos" onDoubleClick={this.play} >
          <div className="title">
            { track.title }
          </div>
          <div className="other-infos">
            <span className="artist">{ track.artist }</span> - <span className="album">{ track.album }</span>
          </div>
        </div>
        <Button bsSize="xsmall" bsStyle="link" className="remove" onClick={this.remove}>
          &times;
        </Button>
      </div>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from 'react-bootstrap';
import classnames from 'classnames';

import QueueListItem from './QueueListItem.react';

import * as QueueActions from '../../actions/QueueActions';

import { getStatus } from '../../utils/utils-library';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

export default class QueueList extends Component {
  static propTypes = {
    queue: PropTypes.array.isRequired,
    queueCursor: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      draggedTrackIndex: null,
      draggedOverTrackIndex: null,
      dragPosition: null, // null, 'above' or 'below'
    };

    this.dragStart = this.dragStart.bind(this);
    this.dragOver = this.dragOver.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
  }

  dragStart(e, index) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);

    this.setState({ draggedTrackIndex: index });
  }

  dragEnd() {
    // Move that to a reducer may be a good idea

    const { queue, queueCursor } = this.props;
    const { dragPosition } = this.state;

    const draggedIndex = this.state.draggedTrackIndex;
    const draggedOverIndex = this.state.draggedOverTrackIndex;

    const offsetPosition = dragPosition === 'below' ? 1 : 0;
    const offsetHigherIndex = draggedOverIndex < draggedIndex || (draggedOverIndex === draggedIndex && dragPosition === 'above') ? 1 : 0;

    // Real position in queue
    const draggedQueueIndex = draggedIndex + queueCursor + 1;
    const draggedOverQueueIndex = draggedOverIndex + queueCursor + offsetPosition + offsetHigherIndex;

    const newQueue = [...queue];

    // remove draggedTrackIndex
    const movedTrack = newQueue.splice(draggedQueueIndex, 1)[0];

    // add removed track at its new position
    newQueue.splice(draggedOverQueueIndex, 0, movedTrack);

    this.setState({
      draggedTrackIndex: null,
      draggedOverTrackIndex: null,
      dragPosition: null,
    });

    QueueActions.setQueue(newQueue);
  }

  dragOver(e, index) {
    e.preventDefault();

    const relativePosition = e.nativeEvent.offsetY / e.currentTarget.offsetHeight;
    const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

    this.setState({
      draggedOverTrackIndex: index,
      dragPosition,
    });
  }

  render() {
    const { queue, queueCursor } = this.props;

    // Get the 20 next tracks displayed
    const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);
    const incomingQueue = queue.slice(queueCursor + 1);

    const queueBodyClasses = classnames('queue-body', {
      dragging: this.state.draggedTrackIndex !== null,
    });

    return (
      <div className="queue text-left">
        <div className="queue-header">
          <div className="queue-infos">
            { getStatus(incomingQueue) }
          </div>
          <ButtonGroup>
            <Button bsSize="xsmall" bsStyle="default" className="empty-button" onClick={QueueActions.clear}>
              clear queue
            </Button>
          </ButtonGroup>
        </div>
        <div className={queueBodyClasses}>
          { shownQueue.map((track, index) => (
            <QueueListItem
              // eslint-disable-next-line react/no-array-index-key
              key={`queue-track-${track._id}-${index}`}
              index={index}
              track={track}
              queueCursor={this.props.queueCursor}
              dragged={index === this.state.draggedTrackIndex}
              draggedOver={index === this.state.draggedOverTrackIndex}
              dragPosition={index === this.state.draggedOverTrackIndex ? this.state.dragPosition : null}
              onDragStart={this.dragStart}
              onDragOver={this.dragOver}
              onDragEnd={this.dragEnd}
            />
            )) }
        </div>
      </div>
    );
  }
}

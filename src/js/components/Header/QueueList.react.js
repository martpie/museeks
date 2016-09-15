import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import classnames from 'classnames';

import QueueListItem  from './QueueListItem.react';

import AppActions from '../../actions/AppActions';

import utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

export default class QueueList extends Component {

    static propTypes = {
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        visible: React.PropTypes.bool
    }

    constructor(props) {

        super(props);

        this.state = {
            draggedTrackIndex     : null,
            draggedOverTrackIndex : null,
            dragPosition     : null // null, 'above' or 'below'
        };

        this.dragStart = this.dragStart.bind(this);
        this.dragOver  = this.dragOver.bind(this);
        this.dragEnd   = this.dragEnd.bind(this);
    }

    render() {

        const self = this;

        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;

        // Get the 20 next tracks displayed
        const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);
        const incomingQueue = queue.slice(queueCursor + 1);

        const queueClasses = classnames('queue text-left', {
            visible: this.props.visible
        });

        const queueBodyClasses = classnames('queue-body', {
            dragging: this.state.draggedTrackIndex !== null
        });

        return (
            <div className={ queueClasses }>
                <div className='queue-header'>
                    <div className='queue-infos'>
                        { utils.getStatus(incomingQueue) }
                    </div>
                    <ButtonGroup>
                        <Button bsSize={ 'xsmall' } bsStyle={ 'default' } className='empty-button' onClick={ AppActions.queue.clear }>
                            clear queue
                        </Button>
                    </ButtonGroup>
                </div>
                <div className={ queueBodyClasses }>
                    { shownQueue.map((track, index) => {
                        return (
                            <QueueListItem
                                index={ index }
                                track={ track }
                                queueCursor={ this.props.queueCursor }
                                dragged={ index === self.state.draggedTrackIndex }
                                draggedOver={ index === self.state.draggedOverTrackIndex }
                                dragPosition={ index === self.state.draggedOverTrackIndex && self.state.dragPosition }
                                onDragStart={ self.dragStart }
                                onDragOver={ this.dragOver }
                                onDragEnd={ self.dragEnd }
                            />
                        );
                    }) }
                </div>
            </div>
        );
    }

    dragStart(e, index) {

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);

        this.setState({ draggedTrackIndex: index });
    }

    dragEnd() {

        // Move that to a reducer may be a good idea

        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;

        const dragPosition = this.state.dragPosition;

        const draggedIndex     = this.state.draggedTrackIndex;
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
            draggedTrackIndex     : null,
            draggedOverTrackIndex : null,
            dragPosition          : null
        });

        AppActions.queue.setQueue(newQueue);
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
}

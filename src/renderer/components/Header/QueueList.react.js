import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import classnames from 'classnames';

import QueueListItem  from './QueueListItem.react';

import lib from '../../lib';

import utils from '../../../shared/utils/utils';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

class QueueList extends Component {

    static propTypes = {
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        trackData: React.PropTypes.object,
        visible: React.PropTypes.bool,
        clear: React.PropTypes.func,
        setQueue: React.PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.state = {
            draggedTrackIndex     : null,
            draggedOverTrackIndex : null,
            dragPosition     : null // null, 'above' or 'below'
        };
    }

    render() {
        const self = this;

        const {
            trackData,
            queue,
            queueCursor,
            visible
        } = this.props;

        const {
            draggedTrackIndex,
            draggedOverTrackIndex,
            dragPosition
        } = this.state;


        // Get the 20 next tracks displayed
        const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);
        const incomingQueue = queue.slice(queueCursor + 1);

        const queueClasses = classnames('queue text-left', {
            visible
        });

        const queueBodyClasses = classnames('queue-body', {
            dragging: draggedTrackIndex !== null
        });

        return (
            <div className={ queueClasses }>
                <div className='queue-header'>
                    <div className='queue-infos'>
                        { utils.getStatus(incomingQueue) }
                    </div>
                    <ButtonGroup>
                        <Button bsSize={ 'xsmall' } bsStyle={ 'default' } className='empty-button' onClick={ this.props.clear }>
                            clear queue
                        </Button>
                    </ButtonGroup>
                </div>
                <div className={ queueBodyClasses }>
                    { shownQueue.map((trackId, index) => {
                        const track = trackData[trackId];
                        return (
                            <QueueListItem
                                key={ index }
                                index={ index }
                                track={ track }
                                queueCursor={ queueCursor }
                                dragged={ index === draggedTrackIndex }
                                draggedOver={ index === draggedOverTrackIndex }
                                dragPosition={ index === draggedOverTrackIndex && dragPosition || null }
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

    dragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);

        this.setState({ draggedTrackIndex: index });
    }

    dragEnd = () => {
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

        this.props.setQueue(newQueue);
    }

    dragOver = (e, index) => {
        e.preventDefault();

        const relativePosition = e.nativeEvent.offsetY / e.currentTarget.offsetHeight;
        const dragPosition = relativePosition < 0.5 ? 'above' : 'below';

        this.setState({
            draggedOverTrackIndex: index,
            dragPosition,
        });
    }
}

const stateToProps = (state) => ({
    trackData: state.tracks.library.data
});

const dispatchToProps = {
    clear: lib.actions.queue.clear,
    setQueue: lib.actions.queue.setQueue
};

export default connect(stateToProps, dispatchToProps)(QueueList);

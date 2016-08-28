import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import classnames from 'classnames';

import QueueItem  from './QueueItem.react';

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
        shown: React.PropTypes.bool
    }

    constructor(props) {

        super(props);

        this.state = {
            draggedTrack     : null,
            draggedOverTrack : null,
            draggedBefore    : true
        };
    }

    render() {
        const self = this;

        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;

        // Get the 20 next tracks displayed
        const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);
        const incomingQueue = queue.slice(queueCursor + 1);

        const queueClasses = classnames('queue text-left', {
            visible: this.props.shown
        });

        const queueBodyClasses = classnames('queue-body', {
            dragging: this.state.draggedTrack !== null
        });

        return (
            <div className={ queueClasses }>
                <div className='queue-header'>
                    <div className='queue-infos'>
                        { utils.getStatus(incomingQueue) }
                    </div>
                    <ButtonGroup>
                        <Button bsSize={ 'xsmall' } bsStyle={ 'default' } className='empty-button' onClick={ this.clearQueue }>
                            clear queue
                        </Button>
                    </ButtonGroup>
                </div>
                <div className={ queueBodyClasses } onDragOver={ this.dragOver.bind(this) }>
                    { shownQueue.map((track, index) => {
                        return (
                            <QueueItem
                                index={ index }
                                track={ track }
                                queueCursor={ this.props.queueCursor }
                                dragged={ index === self.state.draggedTrack }
                                draggedOver={ index === self.state.draggedOverTrack }
                                draggedOverAfter={ index === self.state.draggedOverTrack && !self.state.draggedBefore }
                                onDragStart={ self.dragStart.bind(self, index) }
                                onDragEnd={ self.dragEnd.bind(self) }
                            />
                        );
                    }) }
                </div>
            </div>
        );
    }

    clearQueue() {
        AppActions.queue.clear();
    }

    dragStart(index, e) {

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);

        this.draggedIndex = index;
    }

    dragEnd() {

        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;

        const draggedTrack     = this.state.draggedTrack;
        const draggedOverTrack = this.state.draggedOverTrack;

        const newQueue = queue.slice();
        const trackToMove = queue[queueCursor + 1 + draggedTrack];
        newQueue.splice(queueCursor + 1 + draggedTrack, 1);
        newQueue.splice(queueCursor + draggedOverTrack, 0, trackToMove);

        this.setState({
            draggedOverTrack : null,
            draggedTrack     : null
        });

        AppActions.queue.setQueue(newQueue);
    }

    dragOver(e) {

        e.preventDefault();

        const currentTarget = e.currentTarget;
        const offsetTop     = currentTarget.parentNode.offsetTop + currentTarget.parentNode.parentNode.offsetTop;

        const yEnd  = e.pageY + currentTarget.scrollTop - offsetTop;
        const limit = currentTarget.scrollHeight - currentTarget.lastChild.offsetHeight / 2;

        // If the element is dragged after the half of the last one
        const draggedBefore = yEnd > limit ? false : true;
        const draggedOverTrack = Math.ceil((e.pageY + document.querySelector('.queue-body').scrollTop - 75) / 45);

        // souldn't change. Is here otherwise dragOver wouldn't be triggered
        const index = this.draggedIndex;

        this.setState({
            draggedOverTrack,
            draggedBefore,
            draggedTrack     : index,
            dragging         : true
        });
    }
}

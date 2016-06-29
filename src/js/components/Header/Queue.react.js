import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

import AppActions from '../../actions/AppActions';

import utils from '../../utils/utils';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

export default class Queue extends Component {

    constructor(props) {

        super(props);
        this.state = {
            draggedTrack     : null,
            draggedOverTrack : null,
            draggedBefore    : true
        }
    }

    render() {

        let self        = this;
        let queue       = this.props.queue;
        let queueCursor = this.props.queueCursor;

        let shownQueue = queue.slice(queueCursor + 1, queueCursor + 21); // Get the 20 next tracks displayed
        let incomingQueue = queue.slice(queueCursor + 1);

        let queueContent;

        if(shownQueue.length == 0) {
            return(
                <div className={ this.props.showQueue ? 'queue visible text-left' : 'queue text-left' }>
                    <div className='empty-queue text-center'>
                        queue is empty
                    </div>
                </div>
            );
        } else {

            queueContent = shownQueue.map(function (track, index) {

                let classes = 'track';

                if(index === self.state.draggedTrack) {
                    classes = 'track dragged';
                } else if (index === self.state.draggedOverTrack) {
                    if(!self.state.draggedBefore) {
                        classes = 'track dragged-over-after';
                    } else {
                        classes = 'track dragged-over';
                    }
                }
                else {
                    classes = 'track';
                }

                return (
                    <div key={index}
                      className={ classes }
                      onDoubleClick={ AppActions.queue.selectAndPlay.bind(null, self.props.queueCursor + index + 1) }
                      draggable={'true'}
                      onDragStart={ self.dragStart.bind(self, index) }
                      onDragEnd={ self.dragEnd.bind(self) }>
                        <Button bsSize={'xsmall'} bsStyle={'link'} className='remove' onClick={ self.removeFromQueue.bind(null, index) }>
                            &times;
                        </Button>
                        <div className='title'>
                            { track.title }
                        </div>
                        <div className='other-infos'>
                            <span className='artist'>{ track.artist }</span> - <span className='album'>{ track.album }</span>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div className={ this.props.showQueue ? 'queue visible text-left' : 'queue text-left' }>
                <div className='queue-header'>
                    <div className='queue-infos'>
                        { utils.getStatus(incomingQueue) }
                    </div>
                    <ButtonGroup>
                        <Button bsSize={'xsmall'} bsStyle={'default'} className='empty-button' onClick={ this.clearQueue }>
                            clear queue
                        </Button>
                    </ButtonGroup>
                </div>
                <div className={ this.state.draggedTrack === null ? 'queue-body' : 'queue-body dragging'} onDragOver={ this.dragOver.bind(this) }>
                    { queueContent }
                </div>
            </div>
        );
    }

    clearQueue() {
        AppActions.queue.clear();
    }

    removeFromQueue(index) {
        AppActions.queue.remove(index);
    }

    dragStart(index, e) {

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);

        this.draggedIndex = index;
    }

    dragEnd(e) {

        let queue       = this.props.queue;
        let queueCursor = this.props.queueCursor;

        let draggedTrack     = this.state.draggedTrack;
        let draggedOverTrack = this.state.draggedOverTrack

        let newQueue = queue.slice();
        let trackToMove = queue[queueCursor + 1 + draggedTrack];
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

        let currentTarget = e.currentTarget;
        let offsetTop     = currentTarget.parentNode.offsetTop + currentTarget.parentNode.parentNode.offsetTop;

        let yEnd  = e.pageY + currentTarget.scrollTop - offsetTop;
        let limit = currentTarget.scrollHeight - currentTarget.lastChild.offsetHeight / 2;

        // If the element is dragged after the half of the last one
        let draggedBefore = yEnd > limit ? false : true;
        let draggedOverTrack = Math.ceil((e.pageY + document.querySelector('.queue-body').scrollTop - 75) / 45)

        // souldn't change. Is here otherwise dragOver wouldn't be triggered
        let index = this.draggedIndex;

        this.setState({
            draggedTrack     : index,
            draggedOverTrack : draggedOverTrack,
            draggedBefore    : draggedBefore,
            dragging         : true
        });
    }
}

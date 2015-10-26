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

        var self           = this;
        var playlist       = this.props.playlist;
        var playlistCursor = this.props.playlistCursor;

        var queue = playlist.slice(playlistCursor + 1, playlistCursor + 21); // Get the 20 next tracks displayed

        var wholeQueue = playlist.slice(playlistCursor + 1);
        var wholeQueueDuration = 0;

        for(var i = 0; i < wholeQueue.length; i++) {
            wholeQueueDuration += wholeQueue[i].duration;
        }

        if(queue.length == 0) {
            return playlistContent = (
                <div className={ this.props.showPlaylist ? 'queue visible text-left' : 'queue text-left' }>
                    <div className='empty-queue text-center'>
                        queue is empty
                    </div>
                </div>
            );
        } else {

            var playlistContent = queue.map(function (track, index) {

                var classes = 'track';

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
                      onDoubleClick={ AppActions.selectAndPlay.bind(null, self.props.playlistCursor + index + 1) }
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
                            <span className='artist'}>{ track.artist }</span> - <span className={'album'>{ track.album }</span>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div className={ this.props.showPlaylist ? 'queue visible text-left' : 'queue text-left' }>
                <div className='queue-header'>
                    <div className='queue-infos'>
                        { wholeQueue.length } tracks, { utils.parseDuration(wholeQueueDuration) }
                    </div>
                    <ButtonGroup>
                        <Button bsSize={'xsmall'} bsStyle={'default'} className='empty-button' onClick={ this.clearQueue }>
                            clear queue
                        </Button>
                    </ButtonGroup>
                </div>
                <div className={ this.state.draggedTrack === null ? 'queue-body' : 'queue-body dragging'} onDragOver={ this.dragOver.bind(this) }>
                    { playlistContent }
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

    // TODO
    dragStart(index, e) {

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);

        this.draggedIndex = index;
    }

    dragEnd(e) {

        var playlist       = this.props.playlist;
        var playlistCursor = this.props.playlistCursor;

        var draggedTrack     = this.state.draggedTrack;
        var draggedOverTrack = this.state.draggedOverTrack

        var newPlaylist = playlist.slice();
        var trackToMove = playlist[playlistCursor + 1 + draggedTrack];
        newPlaylist.splice(playlistCursor + 1 + draggedTrack, 1);
        newPlaylist.splice(playlistCursor + draggedOverTrack, 0, trackToMove);

        this.setState({
            draggedOverTrack : null,
            draggedTrack     : null
        });

        AppActions.queue.setPlaylist(newPlaylist);
    }

    dragOver(e) {

        e.preventDefault();

        var currentTarget = e.currentTarget;
        var offsetTop     = currentTarget.parentNode.offsetTop + currentTarget.parentNode.parentNode.offsetTop;

        var yEnd  = e.pageY + currentTarget.scrollTop - offsetTop;
        var limit = currentTarget.scrollHeight - currentTarget.lastChild.offsetHeight / 2;

        // If the element is dragged after the half of the last one
        var draggedBefore = yEnd > limit ? false : true;
        var draggedOverTrack = Math.ceil((e.pageY + document.querySelector('.queue-body').scrollTop - 75) / 45)

        // souldn't change. Is here otherwise dragOver wouldn't be triggered
        var index = this.draggedIndex;

        this.setState({
            draggedTrack     : index,
            draggedOverTrack : draggedOverTrack,
            draggedBefore    : draggedBefore,
            dragging         : true
        });
    }
}

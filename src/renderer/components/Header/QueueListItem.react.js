import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import classnames from 'classnames';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| QueueItem
|--------------------------------------------------------------------------
*/

class QueueListItem extends PureComponent {

    static propTypes = {
        dragged: React.PropTypes.bool,
        draggedOver: React.PropTypes.bool,
        dragPosition: React.PropTypes.string,
        index: React.PropTypes.number,
        track: React.PropTypes.object,
        onDragStart: React.PropTypes.func,
        onDragOver: React.PropTypes.func,
        onDragEnd: React.PropTypes.func,
        queueCursor: React.PropTypes.number,
        loadAndPlay: React.PropTypes.func,
        remove: React.PropTypes.func,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const queueContentClasses = classnames('track', {
            'dragged': this.props.dragged,
            'dragged-over': this.props.draggedOver,
            'above': this.props.draggedOver && this.props.dragPosition === 'above',
            'below': this.props.draggedOver && this.props.dragPosition === 'below'
        });

        const index = this.props.index;
        const track = this.props.track;

        return (
            <div key={ index }
              className={ queueContentClasses }
              draggable='true'
              onDragStart={ this.onDragStart }
              onDragOver={ this.onDragOver }
              onDragEnd={ this.props.onDragEnd }
            >
                <Button bsSize={ 'xsmall' } bsStyle={ 'link' } className='remove' onClick={ this.remove }>
                    &times;
                </Button>
                <div className='track-infos' onDoubleClick={ this.props.loadAndPlay } >
                    <div className='title'>
                        { track.title }
                    </div>
                    <div className='other-infos'>
                        <span className='artist'>{ track.artist }</span> - <span className='album'>{ track.album }</span>
                    </div>
                </div>
            </div>
        );
    }

    loadAndPlay = () => this.props.loadAndPlay(this.props.track._id)

    onDragStart = (e) => this.props.onDragStart(e, this.props.index)

    onDragOver = (e) => this.props.onDragOver(e, this.props.index)

    remove = () => this.props.remove(this.props.index)
}

const stateToProps = () => ({});

const dispatchToProps = {
    remove: lib.actions.queue.remove,
    loadAndPlay: lib.actions.player.loadAndPlay
};

export default connect(stateToProps, dispatchToProps)(QueueListItem);

import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';

import classnames from 'classnames';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| QueueItem
|--------------------------------------------------------------------------
*/

export default class QueueItem extends PureComponent {

    constructor(props) {

        super(props);
    }

    render() {

        const queueContentClasses = classnames('track', {
            'dragged': this.props.dragged,
            'dragged-over': this.props.draggedOver,
            'dragged-over-after': this.props.draggedOverAfter
        });

        const index = this.props.index;
        const track = this.props.track;

        return (
            <div key={ index }
              className={ queueContentClasses }
              draggable='true'
              onDragStart={ this.props.onDragStart }
              onDragEnd={ this.props.onDragEnd }
            >
                <Button bsSize={ 'xsmall' } bsStyle={ 'link' } className='remove' onClick={ this.remove.bind(null, index) }>
                    &times;
                </Button>
                <div className='track-infos' onDoubleClick={ this.play.bind(null, this.props.queueCursor + index + 1) } >
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

    remove(index) {
        AppActions.queue.remove(index);
    }

    play(index) {
        AppActions.queue.selectAndPlay(index);
    }
}

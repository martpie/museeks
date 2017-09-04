import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import classnames from 'classnames';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| QueueItem
|--------------------------------------------------------------------------
*/

export default class QueueListItem extends PureComponent {
    static propTypes = {
      dragged: PropTypes.bool,
      draggedOver: PropTypes.bool,
      dragPosition: PropTypes.string,
      index: PropTypes.number,
      track: PropTypes.object,
      onDragStart: PropTypes.func,
      onDragOver: PropTypes.func,
      onDragEnd: PropTypes.func,
      queueCursor: PropTypes.number,
    }

    constructor(props) {
      super(props);

      this.remove      = this.remove.bind(this);
      this.play        = this.play.bind(this);
      this.onDragStart = this.onDragStart.bind(this);
      this.onDragOver  = this.onDragOver.bind(this);
    }

    render() {
      const queueContentClasses = classnames('track', {
        'dragged': this.props.dragged,
        'dragged-over': this.props.draggedOver,
        'above': this.props.draggedOver && this.props.dragPosition === 'above',
        'below': this.props.draggedOver && this.props.dragPosition === 'below',
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
          <div className='track-infos' onDoubleClick={ this.play } >
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

    onDragStart(e) {
      this.props.onDragStart(e, this.props.index);
    }

    onDragOver(e) {
      this.props.onDragOver(e, this.props.index);
    }

    remove() {
      AppActions.queue.remove(this.props.index);
    }

    play() {
      AppActions.queue.start(this.props.queueCursor + this.props.index + 1);
    }
}

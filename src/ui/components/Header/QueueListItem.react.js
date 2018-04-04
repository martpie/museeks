import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import classnames from 'classnames';

import * as QueueActions from '../../actions/QueueActions';

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

  onDragStart(e) {
    this.props.onDragStart(e, this.props.index);
  }

  onDragOver(e) {
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
      'dragged': this.props.dragged,
      'dragged-over': this.props.draggedOver,
      'above': this.props.draggedOver && this.props.dragPosition === 'above',
      'below': this.props.draggedOver && this.props.dragPosition === 'below',
    });

    const { track } = this.props;

    return (
      <div
        className={queueContentClasses}
        draggable='true'
        onDragStart={this.onDragStart}
        onDragOver={this.onDragOver}
        onDragEnd={this.props.onDragEnd}
      >
        <div className='track-infos' onDoubleClick={this.play} >
          <div className='title'>
            { track.title }
          </div>
          <div className='other-infos'>
            <span className='artist'>{ track.artist }</span> - <span className='album'>{ track.album }</span>
          </div>
        </div>
        <Button bsSize='xsmall' bsStyle='link' className='remove' onClick={this.remove}>
          &times;
        </Button>
      </div>
    );
  }
}

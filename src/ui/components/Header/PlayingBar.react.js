import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import Queue from './Queue.react';
import PlayingBarInfos from './PlayingBarInfos.react';
import Cover from '../Shared/Cover.react';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class PlayingBar extends Component {
  static propTypes = {
    queue: PropTypes.array.isRequired,
    queueCursor: PropTypes.number.isRequired,
    shuffle: PropTypes.bool.isRequired,
    repeat: PropTypes.string.isRequired,
  }

  render() {
    const {
      queue, queueCursor, repeat, shuffle,
    } = this.props;

    if (queueCursor === null) return null;

    const trackPlaying = queue[queueCursor];

    return (
      <div className="now-playing text-center" >
        <div className="now-playing-cover">
          <Cover path={trackPlaying.path} />
        </div>
        <PlayingBarInfos
          trackPlaying={trackPlaying}
          shuffle={shuffle}
          repeat={repeat}
        />
        <div className="now-playing-queue">
          <Dropdown id="queue-dropdown" className="queue-dropdown">
            <Dropdown.Toggle noCaret className="queue-toggle">
              <Icon name="list" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Queue
                queue={this.props.queue}
                queueCursor={this.props.queueCursor}
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

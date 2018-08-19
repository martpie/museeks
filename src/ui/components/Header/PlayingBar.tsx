import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import * as Icon from 'react-fontawesome';

import Queue from './Queue';
import PlayingBarInfos from './PlayingBarInfos';
import Cover from '../Shared/Cover';
import { TrackModel, Repeat } from '../../typings/interfaces';

/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

interface Props {
  queue: TrackModel[];
  queueCursor: number | null;
  shuffle: boolean;
  repeat: Repeat;
}

export default class PlayingBar extends React.Component<Props> {
  render () {
    const {
      queue, queueCursor, repeat, shuffle
    } = this.props;

    if (queueCursor === null) return null;

    const trackPlaying = queue[queueCursor];

    return (
      <div className='now-playing text-center' >
        <div className='now-playing-cover'>
          <Cover path={trackPlaying.path} />
        </div>
        <PlayingBarInfos
          trackPlaying={trackPlaying}
          shuffle={shuffle}
          repeat={repeat}
        />
        <div className='now-playing-queue'>
          <Dropdown id='queue-dropdown' className='queue-dropdown'>
            <Dropdown.Toggle noCaret className='queue-toggle'>
              <Icon name='list' />
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

import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import * as Icon from 'react-fontawesome';

import Queue from '../Queue/Queue';
import PlayingBarInfos from '../PlayingBarInfo/PlayingBarInfo';
import Cover from '../Cover/Cover';
import { TrackModel, Repeat } from '../../../shared/types/interfaces';

import * as styles from './PlayingBar.css';

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
      <div className={styles.playingBar} >
        <div className={styles.playingBar__cover}>
          <Cover path={trackPlaying.path} />
        </div>
        <PlayingBarInfos
          trackPlaying={trackPlaying}
          shuffle={shuffle}
          repeat={repeat}
        />
        <div className={styles.playingBar__queue}>
          <Dropdown id='queue-dropdown' className={styles.queueDropdown}>
            <Dropdown.Toggle noCaret className={styles.queueToggle}>
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

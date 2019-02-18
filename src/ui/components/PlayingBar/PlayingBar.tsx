import * as React from 'react';
import * as Icon from 'react-fontawesome';
import cx from 'classnames';
import ClickOutHandler from 'react-onclickout';

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

interface State {
  queueOpen: boolean;
}

export default class PlayingBar extends React.Component<Props, State> {
  state = {
    queueOpen: false
  };

  constructor (props: Props) {
    super(props);

    this.toggleQueue = this.toggleQueue.bind(this);
    this.closeQueue = this.closeQueue.bind(this);
  }

  toggleQueue () {
    this.setState({
      queueOpen: !this.state.queueOpen
    });
  }

  closeQueue () {
    if (this.state.queueOpen) {
      this.setState({
        queueOpen: false
      });
    }
  }

  render () {
    const { queue, queueCursor, repeat, shuffle } = this.props;

    const queueContainerClasses = cx(styles.queueContainer, {
      [styles.isOpen]: this.state.queueOpen
    });

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
          <ClickOutHandler onClickOut={this.closeQueue}>
            <button
              onClick={this.toggleQueue}
              className={styles.queueToggle}
            >
              <Icon name='list' />
            </button>
            <div className={queueContainerClasses}>
              <Queue
                queue={this.props.queue}
                queueCursor={this.props.queueCursor}
              />
            </div>
          </ClickOutHandler>
        </div>
      </div>
    );
  }
}

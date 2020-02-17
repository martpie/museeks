import * as React from 'react';

import ButtonShuffle from '../PlayerOptionsButtons/ButtonShuffle';
import ButtonRepeat from '../PlayerOptionsButtons/ButtonRepeat';

import * as PlayerActions from '../../actions/PlayerActions';
import Player from '../../lib/player';
import * as utils from '../../utils/utils';
import { TrackModel, Repeat } from '../../../shared/types/interfaces';

import * as styles from './PlayingBarInfo.css';

interface Props {
  trackPlaying: TrackModel;
  shuffle: boolean;
  repeat: Repeat;
}

interface State {
  elapsed: number;
  duration: number | null;
  x: number | null;
  dragging: boolean;
}

class PlayingBarInfo extends React.Component<Props, State> {
  playingBar: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    this.state = {
      elapsed: 0,
      duration: null,
      x: null,
      dragging: false
    };

    this.playingBar = React.createRef();

    this.tick = this.tick.bind(this);

    this.dragOver = this.dragOver.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.jumpAudioTo = this.jumpAudioTo.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentDidMount() {
    Player.getAudio().addEventListener('timeupdate', this.tick);

    window.addEventListener('mousemove', this.dragOver);
    window.addEventListener('mouseup', this.dragEnd);
  }

  componentWillUnmount() {
    Player.getAudio().removeEventListener('timeupdate', this.tick);

    window.removeEventListener('mousemove', this.dragOver);
    window.removeEventListener('mouseup', this.dragEnd);
  }

  tick() {
    this.setState({ elapsed: Player.getCurrentTime() });
  }

  jumpAudioTo(e: React.MouseEvent<HTMLDivElement>) {
    this.setState({ dragging: true });

    const { trackPlaying } = this.props;

    const playingBar = this.playingBar.current;

    if (playingBar) {
      const parent = playingBar.offsetParent as HTMLDivElement;
      const percent = ((e.pageX - (playingBar.offsetLeft + parent.offsetLeft)) / playingBar.offsetWidth) * 100;

      const jumpTo = (percent * trackPlaying.duration) / 100;

      PlayerActions.jumpTo(jumpTo);
    }
  }

  dragOver(e: MouseEvent) {
    // Check if a currentTime update is needed
    if (this.state.dragging) {
      const playingBar = this.playingBar.current;
      const { trackPlaying } = this.props;

      if (playingBar) {
        const playingBarRect = playingBar.getBoundingClientRect();

        const barWidth = playingBar.offsetWidth;
        const offsetX = Math.min(Math.max(0, e.pageX - playingBarRect.left), barWidth);

        const percent = (offsetX / barWidth) * 100;

        const jumpTo = (percent * trackPlaying.duration) / 100;

        PlayerActions.jumpTo(jumpTo);
      }
    }
  }

  dragEnd() {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  }

  showTooltip(e: React.MouseEvent<HTMLDivElement>) {
    const { trackPlaying } = this.props;

    const { offsetX } = e.nativeEvent;
    const barWidth = e.currentTarget.offsetWidth;

    const percent = (offsetX / barWidth) * 100;

    const time = (percent * trackPlaying.duration) / 100;

    this.setState({
      duration: time,
      x: percent
    });
  }

  hideTooltip() {
    this.setState({
      duration: null,
      x: null
    });
  }

  render() {
    const { trackPlaying } = this.props;
    const elapsed = this.state.elapsed / trackPlaying.duration;

    return (
      <div className={styles.playingBar__info}>
        <div className={styles.playingBar__info__metas}>
          <div className={styles.playerOptions}>
            <ButtonRepeat repeat={this.props.repeat} />
            <ButtonShuffle shuffle={this.props.shuffle} />
          </div>
          <div className={styles.metas}>
            <strong>{trackPlaying.title}</strong>
            &nbsp;by&nbsp;
            <strong>{trackPlaying.artist.join(', ')}</strong>
            &nbsp;on&nbsp;
            <strong>{trackPlaying.album}</strong>
          </div>

          <div className={styles.duration}>
            {utils.parseDuration(this.state.elapsed)} / {utils.parseDuration(trackPlaying.duration)}
          </div>
        </div>
        <div className={styles.playingBar__info__progress} ref={this.playingBar}>
          <div
            className={styles.progressTooltip}
            hidden={this.state.duration === null}
            style={{ left: `${this.state.x}%` }}
          >
            {utils.parseDuration(this.state.duration)}
          </div>
          <div
            className={styles.progress}
            role='progressbar'
            tabIndex={0}
            onMouseDown={this.jumpAudioTo}
            onMouseMove={this.showTooltip}
            onMouseLeave={this.hideTooltip}
          >
            <div
              className={styles.progressBar}
              style={elapsed <= 1 ? { transform: `scale3d(${elapsed}, 1, 1)` } : { display: 'none' }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PlayingBarInfo;

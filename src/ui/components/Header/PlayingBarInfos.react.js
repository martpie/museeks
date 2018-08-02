import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ProgressBar } from 'react-bootstrap';

import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat from './ButtonRepeat.react';

import * as PlayerActions from '../../actions/PlayerActions';
import Player from '../../lib/player';
import * as utils from '../../utils/utils';


class PlayingBarInfos extends React.Component {
  static propTypes = {
    trackPlaying: PropTypes.object.isRequired,
    shuffle: PropTypes.bool.isRequired,
    repeat: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      elapsed: 0,
      duration: null,
      x: null,
      dragging: false,
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

  jumpAudioTo(e) {
    this.setState({ dragging: true });

    const { trackPlaying } = this.props;

    const bar = this.playingBar.current;
    const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

    const jumpTo = (percent * trackPlaying.duration) / 100;

    PlayerActions.jumpTo(jumpTo);
  }

  dragOver(e) {
    // Check if a currentTime update is needed
    if (this.state.dragging) {
      const playingBar = this.playingBar.current;
      const { trackPlaying } = this.props;

      const playingBarRect = playingBar.getBoundingClientRect();

      const barWidth = playingBar.offsetWidth;
      const offsetX = Math.min(Math.max(0, e.pageX - playingBarRect.left), barWidth);

      const percent = (offsetX / barWidth) * 100;

      const jumpTo = (percent * trackPlaying.duration) / 100;

      PlayerActions.jumpTo(jumpTo);
    }
  }

  dragEnd() {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  }

  showTooltip(e) {
    const { trackPlaying } = this.props;

    const { offsetX } = e.nativeEvent;
    const barWidth = e.currentTarget.offsetWidth;

    const percent = (offsetX / barWidth) * 100;

    const time = (percent * trackPlaying.duration) / 100;

    this.setState({
      duration: time,
      x: percent,
    });
  }

  hideTooltip() {
    this.setState({
      duration: null,
      x: null,
    });
  }

  render() {
    const { trackPlaying } = this.props;
    const elapsed = this.state.elapsed / trackPlaying.duration;

    const nowPlayingTooltipClasses = classnames('playing-bar-tooltip', {
      hidden: this.state.duration === null,
    });

    return (
      <div className="now-playing-infos">
        <div className="now-playing-metas">
          <div className="player-options">
            <ButtonRepeat repeat={this.props.repeat} />
            <ButtonShuffle shuffle={this.props.shuffle} />
          </div>
          <div className="metas">
            <strong className="meta-title">
              {trackPlaying.title}
            </strong>
            &nbsp;by&nbsp;
            <strong className="meta-artist">
              {trackPlaying.artist.join(', ')}
            </strong>
            &nbsp;on&nbsp;
            <strong className="meta-album">
              {trackPlaying.album}
            </strong>
          </div>

          <span className="duration">
            {utils.parseDuration(this.state.elapsed)} / {utils.parseDuration(trackPlaying.duration)}
          </span>
        </div>
        <div className="now-playing-bar" ref={this.playingBar}>
          <div className={nowPlayingTooltipClasses} style={{ left: `${this.state.x}%` }}>
            {utils.parseDuration(this.state.duration)}
          </div>
          <div
            className="progress"
            role="progressbar"
            tabIndex="0"
            onMouseDown={this.jumpAudioTo}
            onMouseMove={this.showTooltip}
            onMouseLeave={this.hideTooltip}
          >
            <div
              className="progress-bar"
              style={{ transform: `translate3d(0, 0, 0) scaleX(${elapsed})` }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PlayingBarInfos;

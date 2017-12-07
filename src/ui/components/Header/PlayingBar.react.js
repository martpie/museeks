import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Dropdown } from 'react-bootstrap';
import Icon from 'react-fontawesome';


import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat  from './ButtonRepeat.react';
import Queue         from './Queue.react';
import Cover         from '../Shared/Cover.react';

import Player from '../../lib/player';
import utils  from '../../utils/utils';

import AppActions from '../../actions/AppActions';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class PlayingBar extends Component {
  static propTypes = {
    queue: PropTypes.array,
    queueCursor: PropTypes.number,
    shuffle: PropTypes.bool,
    repeat: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      elapsed     : 0,
      showTooltip : false,
      duration    : null,
      x           : null,
      dragging    : false,
    };

    this.tick = this.tick.bind(this);

    this.dragOver = this.dragOver.bind(this);
    this.dragEnd  = this.dragEnd.bind(this);

    this.jumpAudioTo = this.jumpAudioTo.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentDidMount() {
    this.timer = setInterval(this.tick, 100);

    window.addEventListener('mousemove', this.dragOver);
    window.addEventListener('mouseup', this.dragEnd);
  }

  componentWillUnmount() {
    clearInterval(this.timer);

    window.removeEventListener('mousemove', this.dragOver);
    window.removeEventListener('mouseup', this.dragEnd);
  }

  tick() {
    this.setState({ elapsed: Player.getCurrentTime() });
  }

  jumpAudioTo(e) {
    this.setState({ dragging : true });

    const { queue, queueCursor } = this.props;
    const trackPlaying = queue[queueCursor];

    const bar = document.querySelector('.now-playing-bar');
    const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

    const jumpTo = (percent * trackPlaying.duration) / 100;

    AppActions.player.jumpTo(jumpTo);
  }

  dragOver(e) {
    // Chack if it's needed to update currentTime
    if(this.state.dragging) {
      const queue        = this.props.queue;
      const queueCursor  = this.props.queueCursor;
      const trackPlaying = queue[queueCursor];

      const playingBar = this.refs.playingBar;
      const playingBarRect = playingBar.getBoundingClientRect();

      const barWidth = playingBar.offsetWidth;
      const offsetX = Math.min(Math.max(0, e.pageX - playingBarRect.left), barWidth);

      const percent = offsetX / barWidth * 100;

      const jumpTo = (percent * trackPlaying.duration) / 100;

      AppActions.player.jumpTo(jumpTo);
    }
  }

  dragEnd() {
    if(this.state.dragging) {
      this.setState({ dragging : false });
    }
  }

  showTooltip(e) {
    const queue       = this.props.queue;
    const queueCursor = this.props.queueCursor;
    const trackPlaying = queue[queueCursor];

    const offsetX = e.nativeEvent.offsetX;
    const barWidth = e.currentTarget.offsetWidth;

    const percent = offsetX / barWidth * 100;

    const time = (percent * trackPlaying.duration) / 100;

    this.setState({
      duration: time,
      x: percent,
    });
  }

  hideTooltip() {
    this.setState({
      duration : null,
      x        : null,
    });
  }

  render() {
    const queue = this.props.queue;
    const queueCursor = this.props.queueCursor;
    const trackPlaying = queue[queueCursor];

    let elapsedPercent;

    if(queueCursor === null) return null;

    if(this.state.elapsed < trackPlaying.duration) elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

    const nowPlayingTextClasses = classnames('now-playing text-center', {
      dragging: this.state.dragging,
    });

    const nowPlayingTooltipClasses = classnames('playing-bar-tooltip', {
      hidden: this.state.duration === null,
    });

    return (
      <div className={nowPlayingTextClasses} >
        <div className='now-playing-cover'>
          <Cover path={trackPlaying.path} />
        </div>
        <div className='now-playing-infos'>
          <div className='now-playing-metas'>
            <div className='player-options'>
              <ButtonRepeat repeat={this.props.repeat} />
              <ButtonShuffle queue={this.props.queue} shuffle={this.props.shuffle} />
            </div>
            <div className='metas'>
              <strong className='meta-title'>
                { trackPlaying.title }
              </strong>
              &nbsp;by&nbsp;
              <strong className='meta-artist'>
                { trackPlaying.artist.join(', ') }
              </strong>
              &nbsp;on&nbsp;
              <strong className='meta-album'>
                { trackPlaying.album }
              </strong>
            </div>

            <span className='duration'>
              { utils.parseDuration(this.state.elapsed) } / { utils.parseDuration(trackPlaying.duration) }
            </span>
          </div>
          <div className='now-playing-bar' ref='playingBar'>
            <div className={nowPlayingTooltipClasses} style={{ left: `${this.state.x}%` }}>
              { utils.parseDuration(this.state.duration) }
            </div>
            <ProgressBar
              now={elapsedPercent}
              onMouseDown={this.jumpAudioTo}
              onMouseMove={this.showTooltip}
              onMouseLeave={this.hideTooltip}
            />
          </div>
        </div>
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

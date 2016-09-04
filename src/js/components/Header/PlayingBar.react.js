import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';


import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat  from './ButtonRepeat.react';
import TrackCover    from './TrackCover.react';
import Queue         from './Queue.react';

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
        cover: React.PropTypes.string,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        shuffle: React.PropTypes.bool,
        repeat: React.PropTypes.string
    }

    constructor(props) {

        super(props);

        this.state = {
            elapsed     : 0,
            showTooltip : false,
            duration    : null,
            x           : null,
            dragging    : false,
            showQueue   : false
        };

        this.tick = this.tick.bind(this);

        this.dragOver = this.dragOver.bind(this);
        this.dragEnd  = this.dragEnd.bind(this);

        this.jumpAudioTo = this.jumpAudioTo.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.toggleQueue = this.toggleQueue.bind(this);
    }

    render() {

        const queue = this.props.queue;
        const queueCursor = this.props.queueCursor;
        const trackPlaying = queue[queueCursor];

        let elapsedPercent;

        if(queueCursor === null) return null;

        if(this.state.elapsed < trackPlaying.duration) elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

        const nowPlayingTextClasses = classnames('now-playing text-center', {
            dragging: this.state.dragging
        });

        const nowPlayingTooltipClasses = classnames('playing-bar-tooltip', {
            hidden: this.state.duration === null
        });

        return (
            <div className={ nowPlayingTextClasses }
                 onMouseMove={ this.dragOver }
                 onMouseLeave={ this.dragEnd }
                 onMouseUp={ this.dragEnd }
            >
                <div className='now-playing-cover'>
                    <TrackCover cover={ this.props.cover } />
                </div>
                <div className='now-playing-infos'>
                    <div className='now-playing-metas'>
                        <div className='player-options'>
                            <ButtonRepeat repeat={ this.props.repeat } />
                            <ButtonShuffle queue={ this.props.queue } shuffle={ this.props.shuffle } />
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
                    <div className='now-playing-bar'>
                        <div className={ nowPlayingTooltipClasses } style={ { left: this.state.x - 12 } }>
                            { utils.parseDuration(this.state.duration) }
                        </div>
                        <ProgressBar
                            now={ elapsedPercent }
                            onMouseDown={ this.jumpAudioTo }
                            onMouseMove={ this.showTooltip }
                            onMouseLeave={ this.hideTooltip }
                        />
                    </div>
                </div>
                <div className='now-playing-queue'>
                    <button type='button' className='queue-toggle' onClick={ this.toggleQueue }>
                        <Icon name='list' />
                    </button>
                    <Queue
                        visible={ this.state.showQueue }
                        queue={ this.props.queue }
                        queueCursor={ this.props.queueCursor }
                    />
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.timer = setInterval(this.tick, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentWillReceiveProps(nextProps) {

        const nextTrackPlaying = nextProps.queue[nextProps.queueCursor];
        const nextTrackPlayingPath = nextTrackPlaying && nextTrackPlaying.path ? nextTrackPlaying.path : null;

        const currTrackPlaying = this.props.queue[this.props.queueCursor];
        const currTrackPlayingPath = currTrackPlaying && currTrackPlaying.path ? currTrackPlaying.path : null;

        if(nextTrackPlayingPath !== currTrackPlayingPath) {
            AppActions.library.fetchCover(nextTrackPlayingPath);
        }
    }

    tick() {
        this.setState({ elapsed: Player.getAudio().currentTime });
    }

    jumpAudioTo(e) {

        this.setState({ dragging : true });

        const queue       = this.props.queue;
        const queueCursor = this.props.queueCursor;
        const trackPlaying   = queue[queueCursor];

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

            const bar = document.querySelector('.now-playing-bar');
            const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

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
        const trackPlaying   = queue[queueCursor];

        const bar = document.querySelector('.now-playing-bar');
        const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        const time = (percent * trackPlaying.duration) / 100;

        this.setState({
            duration : time,
            x        : e.pageX
        });
    }

    hideTooltip() {
        this.setState({
            duration : null,
            x        : null
        });
    }

    toggleQueue() {
        this.setState({ showQueue: !this.state.showQueue });
    }
}

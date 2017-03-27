import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat  from './ButtonRepeat.react';
import TrackCover    from './TrackCover.react';
import Queue         from './Queue.react';

import lib from '../../lib';
import utils from '../../../shared/utils/utils';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

class PlayingBar extends Component {

    static propTypes = {
        cover: React.PropTypes.string,
        currentTrack: React.PropTypes.object,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        repeat: React.PropTypes.string,
        shuffle: React.PropTypes.bool,
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
    }

    render() {
        const { cover, currentTrack, shuffle, repeat, queue, queueCursor } = this.props;
        const { elapsed, dragging, duration, x, showQueue } = this.state;

        let elapsedPercent;

        if (!currentTrack || !currentTrack._id) return null;

        if (elapsed < currentTrack.duration) elapsedPercent = elapsed * 100 / currentTrack.duration;

        const nowPlayingTextClasses = classnames('now-playing text-center', {
            dragging: dragging
        });

        const nowPlayingTooltipClasses = classnames('playing-bar-tooltip', {
            hidden: duration === null
        });

        return (
            <div className={ nowPlayingTextClasses }
                 onMouseMove={ this.dragOver }
                 onMouseLeave={ this.dragEnd }
                 onMouseUp={ this.dragEnd }
            >
                <div className='now-playing-cover'>
                    <TrackCover src={ cover } />
                </div>
                <div className='now-playing-infos'>
                    <div className='now-playing-metas'>
                        <div className='player-options'>
                            <ButtonRepeat repeat={ repeat } />
                            <ButtonShuffle queue={ queue } shuffle={ shuffle } />
                        </div>
                        <div className='metas'>
                            <strong className='meta-title'>
                                { currentTrack.title }
                            </strong>
                            &nbsp;by&nbsp;
                            <strong className='meta-artist'>
                                { currentTrack.artist.join(', ') }
                            </strong>
                            &nbsp;on&nbsp;
                            <strong className='meta-album'>
                                { currentTrack.album }
                            </strong>
                        </div>

                        <span className='duration'>
                            { utils.parseDuration(this.state.elapsed) } / { utils.parseDuration(currentTrack.duration) }
                        </span>
                    </div>
                    <div className='now-playing-bar'>
                        <div className={ nowPlayingTooltipClasses } style={ { left: x - 12 } }>
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
                        visible={ showQueue }
                        queue={ queue }
                        queueCursor={ queueCursor }
                    />
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        this.timer = setInterval(this.tick, 100);
    }

    componentWillUnmount = () => {
        clearInterval(this.timer);
    }

    componentWillReceiveProps = (nextProps) => {
        const nextTrackPlaying = nextProps.currentTrack;
        const nextTrackPlayingId = nextTrackPlaying && nextTrackPlaying._id;

        const currTrackPlaying = this.props.currentTrack;
        const currTrackPlayingId = currTrackPlaying && currTrackPlaying._id;

        // if we have a track to play, and it wasn't the last track we played
        if (nextTrackPlayingId && nextTrackPlayingId !== currTrackPlayingId) {
            this.props.fetchCover(nextTrackPlaying);
        }
    }

    tick = () => {
        this.setState({ elapsed: lib.player.getCurrentTime() });
    }

    jumpAudioTo = (e) => {
        this.setState({ dragging : true });

        const { currentTrack } = this.props;

        const bar = document.querySelector('.now-playing-bar');
        const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        const jumpTo = (percent * currentTrack.duration) / 100;

        this.props.jumpTo(jumpTo);
    }

    dragOver = (e) => {
        // Chack if it's needed to update currentTime
        if (this.state.dragging) {
            const { currentTrack } = this.props;

            const bar = document.querySelector('.now-playing-bar');
            const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

            const jumpTo = (percent * currentTrack.duration) / 100;

            this.props.jumpTo(jumpTo);
        }
    }

    dragEnd = () => {
        if (this.state.dragging) {
            this.setState({ dragging : false });
        }
    }

    showTooltip = (e) => {
        const { currentTrack } = this.props;

        const bar = document.querySelector('.now-playing-bar');
        const percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        const time = (percent * currentTrack.duration) / 100;

        this.setState({
            duration: time,
            x: e.pageX
        });
    }

    hideTooltip = () => {
        this.setState({
            duration: null,
            x: null
        });
    }

    toggleQueue = () => {
        this.setState({ showQueue: !this.state.showQueue });
    }
};

const stateToProps = () => ({});

const dispatchToProps = {
    jumpTo: lib.actions.player.jumpTo,
    fetchCover: lib.actions.player.fetchCover
};

export default connect(stateToProps, dispatchToProps)(PlayingBar);

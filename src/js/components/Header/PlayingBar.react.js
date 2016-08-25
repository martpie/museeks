import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import classnames from 'classnames';

import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat  from './ButtonRepeat.react';
import TrackCover    from './TrackCover.react';

import Player from '../../lib/player';
import utils  from '../../utils/utils';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class PlayingBar extends Component {

    static propTypes = {
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
            dragging    : false
        };

        this.tick        = this.tick.bind(this);
        this.showTooltip = this.showTooltip.bind(this);

        const trackPlaying =  this.props.queue[this.props.queueCursor];

        this.coverBase64 = trackPlaying && trackPlaying.cover ? utils.parseBase64(trackPlaying.cover.format, trackPlaying.cover.data) : '';
    }

    render() {

        const queue = this.props.queue;
        const queueCursor = this.props.queueCursor;
        const trackPlaying = queue[queueCursor];

        let playingBar;
        let elapsedPercent;

        // TODO (y.solovyov): we can just return null here and it will render nothing.
        if(queueCursor === null) {
            playingBar = <div></div>;
        } else {

            if(this.state.elapsed < trackPlaying.duration) elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

            const nowPlayingTextClasses = classnames('now-playing text-center', {
                dragging: this.state.dragging
            });

            const nowPlayingTooltipClasses = classnames('playing-bar-tooltip', {
                hidden: this.state.duration === null
            });

            playingBar = (
                <div className={ nowPlayingTextClasses }
                     onMouseMove={ this.dragOver.bind(this) }
                     onMouseLeave={ this.dragEnd.bind(this) }
                     onMouseUp={ this.dragEnd.bind(this) }
                >
                    <div className='now-playing-cover'>
                        <TrackCover cover={ this.coverBase64 } />
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
                                onMouseDown={ this.jumpAudioTo.bind(this) }
                                onMouseMove={ this.showTooltip.bind(this) }
                                onMouseLeave={ this.hideTooltip.bind(this) }
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return playingBar;
    }

    componentDidMount() {
        this.timer = setInterval(this.tick, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentWillReceiveProps(nextProps) {

        const trackPlaying =  nextProps.queue[nextProps.queueCursor];

        this.coverBase64 = trackPlaying && trackPlaying.cover ? utils.parseBase64(trackPlaying.cover.format, trackPlaying.cover.data) : '';
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

            const queue       = this.props.queue;
            const queueCursor = this.props.queueCursor;
            const trackPlaying   = queue[queueCursor];

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
}

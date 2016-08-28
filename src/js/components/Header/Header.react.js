import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import Input from 'react-simple-input';

import PlayingBar     from './PlayingBar.react';
import Queue          from './Queue.react';
import WindowControls from './WindowControls.react';
import PlayerControls from './PlayerControls.react';

import AppActions from '../../actions/AppActions';

import Player from '../../lib/player';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

export default class Header extends Component {

    static propTypes = {
        playerStatus: React.PropTypes.string,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        shuffle: React.PropTypes.bool,
        repeat: React.PropTypes.string,
        windowControls: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
        this.state = {
            showVolume : false,
            showQueue  : false
        };
        this.mute = this.mute.bind(this);
    }

    render() {

        return (
            <header className='row'>
                <Col sm={ 3 } className='main-controls'>
                    <WindowControls
                        active={ this.props.windowControls }
                        onClose={ this.winClose }
                    />

                    <PlayerControls
                        audio={ Player.getAudio() }
                        showVolume={ this.state.showVolume }
                        previous={ this.previous }
                        next={ this.next }
                        playerStatus={ this.props.playerStatus }
                        playToggle={ this.playToggle.bind(this) }
                        onShowVolume={ this.showVolume.bind(this) }
                        onHideVolume={ this.hideVolume.bind(this) }
                        onVolumeChange={ this.setVolume.bind(this) }
                        onMute={ this.mute.bind(this) }
                    />
                </Col>
                <Col sm={ 6 }>
                    <PlayingBar
                        queue={ this.props.queue }
                        queueCursor={ this.props.queueCursor }
                        shuffle={ this.props.shuffle }
                        repeat={ this.props.repeat }
                    />
                </Col>
                <Col sm={ 1 } className='queue-controls text-center'>
                    <button type='button' className='queue-toggle' onClick={ this.toggleQueue.bind(this) }>
                        <Icon name='list' />
                    </button>
                    <Queue
                        showQueue={ this.state.showQueue }
                        queue={ this.props.queue }
                        queueCursor={ this.props.queueCursor }
                    />
                </Col>
                <Col sm={ 2 }>
                    <Input
                        selectOnClick
                        placeholder='search'
                        className='form-control input-sm search'
                        changeTimeout={ 250 }
                        clearButton
                        ref='search'
                        onChange={ this.search.bind(null) }
                    />
                </Col>
            </header>
        );
    }

    winClose() {
        AppActions.app.close();
    }

    search(value) {
        AppActions.library.filterSearch(value.toLowerCase());
    }

    searchSelect() {
        this.refs.search.select();
    }

    playToggle() {
        if(this.props.playerStatus === 'play') this.pause();
        else if (this.props.playerStatus === 'pause') this.play();
    }

    play() {
        AppActions.player.play();
    }

    pause() {
        AppActions.player.pause();
    }

    toggleRepeat() {
        AppActions.player.toggleRepeat();
    }

    next() {
        AppActions.player.next();
    }

    previous() {
        AppActions.player.previous();
    }

    setVolume(e) {
        AppActions.player.setVolume(parseFloat(e.target.value));
    }

    showVolume() {
        this.setState({ showVolume: true });
    }

    mute(e) {

        if(e.target.classList.contains('player-control') || e.target.classList.contains('fa')) {

            AppActions.player.setMuted(!Player.getAudio().muted);
        }
    }

    hideVolume() {
        this.setState({ showVolume: false });
    }

    toggleQueue() {
        this.setState({ showQueue: !this.state.showQueue });
    }
}

import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import PlayingBar from './PlayingBar.react';
import Queue      from './Queue.react';

import AppActions from '../../actions/AppActions';

import app from '../../constants/app';



/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

export default class Header extends Component {

    constructor(props) {

        super(props);
        this.state = {
            showVolume   : false,
            showPlaylist : false
        }
    }

    render() {

        if (this.props.playerStatus === 'play') {
            var playButton = (
                <button className='player-control play' onClick={ this.pause.bind(null) }>
                    <Icon name='pause' />
                </button>
            );
        } else if (this.props.playerStatus === 'pause') {
            var playButton = (
                <button className='player-control play' onClick={ this.play.bind(null) }>
                    <Icon name='play' />
                </button>
            );
        } else {
            var playButton = (
                <button className='player-control play'>
                    <Icon name='play' />
                </button>
            );
        }

        return (
            <header className='row'>
                <Col sm={3} className='main-controls'>
                    <div className='window-controls'>
                        <button className='window-control' onClick={ this.winClose.bind(null) }>&times;</button>
                    </div>

                    <div className='player-controls text-center'>
                        <button type='button' className='player-control previous' onClick={ this.previous.bind(null) }>
                            <Icon name='backward' />
                        </button>
                        { playButton }
                        <button type='button' className='player-control forward' onClick={ this.next.bind(null) }>
                            <Icon name='forward' />
                        </button>
                        <button type='button' className='player-control volume' onMouseEnter={ this.showVolume.bind(this) } onMouseLeave={ this.hideVolume.bind(this) }>
                            <Icon name='volume-up' />
                            <div className={ this.state.showVolume ? 'volume-control visible' : 'volume-control' }>
                                <input type={'range'} min={0} max={100} defaultValue={100} ref='volume' onChange={ this.setVolume.bind(this) } />
                            </div>
                        </button>
                    </div>
                </Col>
                <Col sm={6} className='text-center'>
                    <PlayingBar
                        playlist={ this.props.playlist }
                        playlistCursor={ this.props.playlistCursor }
                        shuffle={ this.props.shuffle }
                        repeat={ this.props.repeat }
                    />
                </Col>
                <Col sm={1} className='queue-controls text-center'>
                    <button type='button' className='queue-toggle' onClick={ this.togglePlaylist.bind(this) }>
                        <i className='fa fa-fw fa-list'></i>
                    </button>
                    <Queue
                        showPlaylist={ this.state.showPlaylist }
                        playlist={ this.props.playlist }
                        playlistCursor={ this.props.playlistCursor }
                    />
                </Col>
                <Col sm={2}>
                    <input type='text' className='search form-control input-sm' placeholder='search' ref='search' onClick={ this.searchSelect.bind(this) } onChange={ this.search.bind(this) } />
                </Col>
            </header>
        );
    }

    winClose() {
        AppActions.app.close();
    }

    search() {
        var self = this;
        var now  = window.performance.now();

        if(now - this.lastFilterSearch < 250) {
            clearTimeout(this.filterSearchTimeOut);
        }

        this.lastFilterSearch = now;

        this.filterSearchTimeOut = setTimeout(function() {
            AppActions.filterSearch(self.refs.search.value)
        }, 250);
    }

    searchSelect() {
        this.refs.search.select();
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

    setVolume() {
        app.audio.volume = this.refs.volume.value / 100;
    }

    showVolume() {
        this.setState({ showVolume: true });
    }

    hideVolume() {
        this.setState({ showVolume: false });
    }

    togglePlaylist() {
        if (this.state.showPlaylist)
            this.setState({ showPlaylist: false });
        else
            this.setState({ showPlaylist: true });
    }
}

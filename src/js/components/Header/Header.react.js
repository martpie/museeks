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
            showQueue  : false
        };
    }

    render() {

        return (
            <header className='row'>
                <Col sm={ 3 } className='main-controls'>
                    <WindowControls active={ this.props.windowControls } />

                    <PlayerControls
                        audio={ Player.getAudio() }
                        playerStatus={ this.props.playerStatus }
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

    toggleRepeat() {
        AppActions.player.toggleRepeat();
    }

    search(value) {
        AppActions.library.filterSearch(value.toLowerCase());
    }

    toggleQueue() {
        this.setState({ showQueue: !this.state.showQueue });
    }
}

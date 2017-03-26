import React, { Component } from 'react';
import Input from 'react-simple-input';
import { connect } from 'react-redux';

import PlayingBar     from './PlayingBar.react';
import WindowControls from './WindowControls.react';
import PlayerControls from './PlayerControls.react';

import lib from '../../lib';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

class Header extends Component {

    static propTypes = {
        cover: React.PropTypes.string,
        currentTrack: React.PropTypes.object,
        playStatus: React.PropTypes.string,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        repeat: React.PropTypes.string,
        shuffle: React.PropTypes.bool,
        windowControls: React.PropTypes.bool,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const {
            cover,
            currentTrack,
            playStatus,
            queue,
            queueCursor,
            repeat,
            shuffle,
            windowControls,
        } = this.props;

        return (
            <header className='row'>
                <div className='col-main-controls'>
                    <WindowControls active={ windowControls } />
                    <PlayerControls playStatus={ playStatus } />
                </div>

                <div className='col-player-infos'>
                    <PlayingBar
                        cover={ cover }
                        currentTrack={ currentTrack }
                        shuffle={ shuffle }
                        repeat={ repeat }
                        queue={ queue }
                        queueCursor={ queueCursor }
                    />
                </div>
                <div className="col-search-controls">
                    <Input
                        selectOnClick
                        placeholder='search'
                        className='form-control input-sm search'
                        changeTimeout={ 250 }
                        clearButton
                        ref='search'
                        onChange={ this.search }
                    />
                </div>
            </header>
        );
    }

    search = (e) => {
        this.props.filter(e.target.value);
    }
}

const stateToProps = (state) => ({
    cover: state.player.cover,
    currentTrack: state.player.currentTrack,
    playStatus: state.player.playStatus,
    repeat: state.player.repeat,
    shuffle: state.player.shuffle,
    queue: state.queue,
    queueCursor: state.queueCursor,
    windowControls: !state.config.useNativeFrame,
});

const dispatchToProps = {
    filter: lib.actions.tracks.filter
};

export default connect(stateToProps, dispatchToProps)(Header);

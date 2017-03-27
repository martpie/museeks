import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Toasts from './Toasts/Toasts.react';

import lib from '../lib';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

class Museeks extends Component {

    static propTypes = {
        store: React.PropTypes.object,
        children: React.PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        const state = this.props.state;
        const trackPlayingId = state.player.currentTrack && state.player.currentTrack._id ? state.player.currentTrack._id : null;

        const tracks = state.tracks[state.tracks.tracksCursor].sub.map(trackId => state.tracks[state.tracks.tracksCursor].data[trackId]);
        const library = state.tracks[state.tracks.tracksCursor].all.map(trackId => state.tracks[state.tracks.tracksCursor].data[trackId]);

        return (
            <div className='main'>
                <KeyBinding onKey={ this.onKey } preventInputConflict />
                <Header />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app: this,
                                config: state.config,
                                playStatus: state.player.playStatus,
                                network: state.network,
                                queue: state.queue,
                                tracks,
                                library,
                                playlists: state.playlists,
                                refreshingLibrary: state.library.refreshingLibrary,
                                refreshProgress: state.refreshProgress,
                                trackPlayingId
                            })
                        }
                    </Row>
                </div>
                <Footer
                    network={ state.network }
                    tracks={ tracks }
                    refreshingLibrary={ state.library.refreshingLibrary }
                />
                <Toasts toasts={ state.toasts } />
            </div>
        );
    }

    onKey = (e) => {
        switch(e.keyCode) {
            case 32:
                e.preventDefault();
                e.stopPropagation();
                this.props.playToggle();
                break;
        }
    }
}

const stateToProps = (state) => ({ state });

const dispatchToProps = {
    playToggle: lib.actions.player.playToggle
};

export default connect(stateToProps, dispatchToProps)(Museeks);

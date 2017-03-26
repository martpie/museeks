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
        const trackPlayingId = (state.queue.length > 0 && state.queueCursor !== null) ? state.queue[state.queueCursor]._id : null;
console.log(state)
        return (
            <div className='main'>
                <KeyBinding onKey={ this.onKey } preventInputConflict />
                <Header
                    app={ this }
                    playStatus={ state.player.playStatus }
                    repeat={ state.repeat }
                    shuffle={ state.shuffle }
                    cover={ state.player.cover }
                    queue={ state.queue }
                    queueCursor={ state.queueCursor }
                    windowControls={ !state.config.useNativeFrame }
                    network={ state.network }
                />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app: this,
                                config: state.config,
                                playStatus: state.player.playStatus,
                                network: state.network,
                                queue: state.queue,
                                tracks: state.tracks[state.tracks.tracksCursor].sub,
                                library: state.tracks[state.tracks.tracksCursor].all,
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
                    tracks={ state.tracks[state.tracks.tracksCursor].sub }
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

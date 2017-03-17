import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Toasts from './Toasts/Toasts.react';

import { actions } from '../lib';

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

        this.onKey = this.onKey.bind(this);
    }

    render() {
        const store = this.props.store;
        const trackPlayingId = (store.queue.length > 0 && store.queueCursor !== null) ? store.queue[store.queueCursor]._id : null;

        return (
            <div className='main'>
                <KeyBinding onKey={ this.onKey } preventInputConflict />
                <Header
                    app={ this }
                    playerStatus={ store.playerStatus }
                    repeat={ store.repeat }
                    shuffle={ store.shuffle }
                    cover={ store.cover }
                    queue={ store.queue }
                    queueCursor={ store.queueCursor }
                    windowControls={ !store.config.useNativeFrame }
                />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app               : this,
                                config            : store.config,
                                playerStatus      : store.playerStatus,
                                queue             : store.queue,
                                tracks            : store.tracks[store.tracksCursor].sub,
                                library           : store.tracks[store.tracksCursor].all,
                                playlists         : store.playlists,
                                refreshingLibrary : store.refreshingLibrary,
                                refreshProgress   : store.refreshProgress,
                                trackPlayingId
                            })
                        }
                    </Row>
                </div>
                <Footer
                    tracks={ store.tracks[store.tracksCursor].sub }
                    refreshingLibrary={ store.refreshingLibrary }
                />
                <Toasts toasts={ store.toasts } />
            </div>
        );
    }

    onKey(e) {
        switch(e.keyCode) {
            case 32:
                e.preventDefault();
                e.stopPropagation();
                this.props.playToggle();
                break;
        }
    }
}

const stateToProps = (state) => ({ store: { ...state } });

const dispatchToProps = {
    playToggle: actions.player.playToggle
};

export default connect(stateToProps, dispatchToProps)(Museeks);

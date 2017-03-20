import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';

import { connect } from 'react-redux';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Toasts from './Toasts/Toasts.react';

import AppActions from '../actions/AppActions';

import app from '../lib/app';


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

        const config = { ...app.config.getAll() };

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
                    windowControls={ !config.useNativeFrame }
                />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app               : this,
                                config,
                                playerStatus      : store.playerStatus,
                                queue             : store.queue,
                                tracks            : {
                                    all: store.tracks[store.tracksCursor].all,
                                    sub: store.tracks[store.tracksCursor].sub
                                },
                                playlists         : store.playlists,
                                library           : store.library,
                                trackPlayingId
                            })
                        }
                    </Row>
                </div>
                <Footer
                    tracks={ store.tracks[store.tracksCursor].sub }
                    library={ store.library }
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
                AppActions.player.playToggle();
                break;
        }
    }
}

function mapStateToProps(state) {
    return { store: { ...state } };
}

export default connect(mapStateToProps)(Museeks);

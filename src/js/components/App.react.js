import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';

import { connect } from 'react-redux';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Notifications from './Notifications/Notifications.react';

import AppActions from '../actions/AppActions';

import initialState from '../reducers/initial-state';

import app from '../utils/app';


/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

class Museeks extends Component {

    static propTypes = {
        children: React.PropTypes.object
    }

    constructor(props) {

        super(props);
        this.state = initialState;
    }

    render() {

        const trackPlayingId = (this.state.queue.length > 0 && this.state.queueCursor !== null) ? this.state.queue[this.state.queueCursor]._id : null;

        return (
            <div className='main'>
                <KeyBinding onKey={ (e) => this.onKey(e) } preventInputConflict />
                <Header
                    app={ this }
                    playerStatus={ this.state.playerStatus }
                    repeat={ this.state.repeat }
                    shuffle={ this.state.shuffle }
                    queue={ this.state.queue }
                    queueCursor={ this.state.queueCursor }
                />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app               : this,
                                config            : app.config.getAll(),
                                queue             : this.state.queue,
                                tracks            : this.state.tracks[this.state.tracksCursor].sub,
                                library           : this.state.tracks[this.state.tracksCursor].all,
                                playlists         : this.state.playlists,
                                refreshingLibrary : this.state.refreshingLibrary,
                                refreshProgress   : this.state.refreshProgress,
                                trackPlayingId
                            })
                        }
                    </Row>
                </div>
                <Footer
                    tracks={ this.state.tracks }
                    refreshingLibrary={ this.state.refreshingLibrary }
                />
                <Notifications notifications={ this.state.notifications } />
            </div>
        );
    }

    onKey(e) {
        switch(e.keyCode) {
            case 32:
                e.preventDefault();
                e.stopPropagation();
                if(this.state.playerStatus === 'pause') AppActions.player.play();
                else if(this.state.playerStatus === 'play') AppActions.player.pause();
                break;
        }
    }
}

function mapStateToProps(state) {
    return state;
}

const MuseeksCo = connect(mapStateToProps)(Museeks);

export default MuseeksCo;

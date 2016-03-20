import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import KeyBinding from 'react-keybinding-component';

import app from '../utils/app';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';
import Notifications from './Notifications/Notifications.react';

import AppActions from '../actions/AppActions';
import AppStore   from '../stores/AppStore';



/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

export default class Museeks extends Component {

    constructor(props) {

        super(props);
        this.state = AppStore.getStore();
        this.updateState = this.updateState.bind(this);
    }

    render() {

        var trackPlayingID = (this.state.queue.length > 0 && this.state.queueCursor !== null) ? this.state.queue[this.state.queueCursor]._id : null;

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
                                config            : this.state.config,
                                queue          : this.state.queue,
                                tracks            : this.state.tracks,
                                library           : this.state.library,
                                trackPlayingID    : trackPlayingID,
                                refreshingLibrary : this.state.refreshingLibrary,
                                refreshProgress   : this.state.refreshProgress
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

    componentDidMount() {
        AppStore.addChangeListener(this.updateState);
        AppActions.init();
    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this.updateState);
    }

    updateState() {
        this.setState(AppStore.getStore());
    }
}

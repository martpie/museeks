import React, { Component } from 'react';
import { Row } from 'react-bootstrap';

import app from '../constants/app.js';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';

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

        var trackPlayingID = (this.state.playlist.length > 0 && this.state.playlistCursor !== null) ? this.state.playlist[this.state.playlistCursor]._id : null;
        var status         = 'An apple a day keeps Dr Dre away';

        return (
            <div className='main'>
                <Header
                    app={ this }
                    playerStatus={ this.state.playerStatus }
                    repeat={ this.state.repeat }
                    shuffle={ this.state.shuffle }
                    playlist={ this.state.playlist }
                    playlistCursor={ this.state.playlistCursor }
                />
                <div className='main-content'>
                    <Row className='content'>
                        { React.cloneElement(
                            this.props.children, {
                                app               : this,
                                config            : this.state.config,
                                playlist          : this.state.playlist,
                                tracks            : this.state.tracks,
                                library           : this.state.library,
                                trackPlayingID    : trackPlayingID,
                                refreshingLibrary : this.state.refreshingLibrary,
                            })
                        }
                    </Row>
                </div>
                <Footer
                    status={ status }
                    refreshingLibrary={ this.state.refreshingLibrary }
                />
            </div>
        );
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

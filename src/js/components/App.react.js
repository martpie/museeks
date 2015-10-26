import React, { Component } from 'react';
import { Row } from 'react-bootstrap';

import app from '../constants/app.js';

import Header from './Header/Header.react';
import Footer from './Footer/Footer.react';

import AppActions from '../actions/AppActions';
import AppStore   from '../stores/AppStore';

import remote from 'remote';

var globalShortcut = remote.require('global-shortcut');



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
                                playlist          : this.state.playlist,
                                tracks            : this.state.tracks,
                                library           : this.state.library,
                                trackPlayingID    : trackPlayingID,
                                refreshingLibrary : this.state.refreshingLibrary,
                                musicFolders      : this.state.musicFolders
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

    filterSearch(search) {
        AppActions.filterSearch(search);
    }

    componentDidMount() {
        AppStore.addChangeListener(this.updateState);
    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this.updateState);
    }

    updateState() {
        this.setState(AppStore.getStore());
    }

    componentWillMount() {

        var self      = this;

        // Theme support
        var themeName = localStorage.getItem('config').theme;

        var theme = document.createElement('link');
            theme.type  = 'text/css';
            theme.rel   = 'stylesheet';
            theme.media = 'all';
            theme.href  =  app.pathSrc + '/dist/css/themes/' + themeName + '/theme-' + themeName + '.css';
            theme.id    = 'theme-stylesheet';

        document.querySelector('head').appendChild(theme);


        // Prevent some events
        window.addEventListener('dragover', function (e) {
               e.preventDefault();
           }, false);

        window.addEventListener('drop', function (e) {
            e.preventDefault();
        }, false);


        // Register global shorcuts
        var shortcuts = {};

        shortcuts.play = globalShortcut.register('MediaPlayPause', function () {
            self.player.playToggle.bind(self);
        });

        shortcuts.previous = globalShortcut.register('MediaPreviousTrack', function () {
            self.player.previous.bind(self);
        });

        shortcuts.previous = globalShortcut.register('MediaNextTrack', function () {
            self.player.next.bind(self);
        });


        // Refresh the library
        AppActions.refreshLibrary();

    }
}

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PlaylistsNav from './PlaylistsNav.react';
import FullViewMessage from '../Shared/FullViewMessage.react';

import { actions } from '../../lib';


/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

class Playlists extends Component {

    static propTypes = {
        params: React.PropTypes.object,
        children: React.PropTypes.object,
        tracks: React.PropTypes.array,
        playlists: React.PropTypes.array,
        playerStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    createPlaylist() {
        this.props.create('New playlist', true);
    }

    render() {
        let playlistContent;

        if (this.props.playlists === null) {
            playlistContent = (
                <FullViewMessage>
                    <p>Loading playlists</p>
                </FullViewMessage>
            );
        } else if (this.props.playlists.length === 0) {
            playlistContent = (
                <FullViewMessage>
                    <p>You haven't created any playlists yet</p>
                    <p className='sub-message'>
                        <a onClick={ this.createPlaylist }>create one now</a>
                    </p>
                </FullViewMessage>
            );
        } else if (!this.props.params.playlistId) {
            playlistContent = (
                <FullViewMessage>
                    <p>Select a playlist in the menu on the left</p>
                </FullViewMessage>
            );
        } else {
            playlistContent = React.cloneElement(this.props.children, { ...this.props });
        }

        return (
            <div className='view view-playlists'>
                <PlaylistsNav playlists={ this.props.playlists } />
                <div className='playlist'>
                    { playlistContent }
                </div>
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    create: actions.playlists.create
};

export default connect(stateToProps, dispatchToProps)(Playlists);

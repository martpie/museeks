import React, { Component } from 'react';

import PlaylistsNav from './PlaylistsNav.react';
import FullViewMessage from '../Shared/FullViewMessage.react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

    static propTypes = {
        params: React.PropTypes.object,
        children: React.PropTypes.object,
        tracks: React.PropTypes.array,
        playlists: React.PropTypes.array
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    createPlaylist() {
        AppActions.playlists.create('New playlist', true);
    }

    getContent() {
        if(this.props.playlists === null) {
            return <FullViewMessage message='Loading playlists' />;
        }

        if(this.props.playlists.length === 0) {
            return (
                <FullViewMessage message="You haven't created any playlist yet">
                    <a onClick={ this.createPlaylist }> create one now </a>
                </FullViewMessage>
            );
        }

        if(!this.props.params.playlistId) {
            return <FullViewMessage message='Select a playlist in the menu on the left' />;
        }

        return React.cloneElement(this.props.children, { ...this.props });
    }

    render() {
        return (
            <div className='view view-playlists'>
                <PlaylistsNav playlists={ this.props.playlists } />
                <div className='playlist'>
                    { this.getContent() }
                </div>
            </div>
        );
    }
}

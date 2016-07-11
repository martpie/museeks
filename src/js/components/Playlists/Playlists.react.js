import React, { Component } from 'react';

import PlaylistsNav from './PlaylistsNav.react';



/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let content;

        if(this.props.playlists === null) {
            content = (
                <div className='full-message'>
                    <p>Loading playlists</p>
                </div>
            );
        }
        else {

            let playlist = null;

            for(let i = 0, length = this.props.playlists.length; i < length; i++) {

                if(this.props.playlists[i]._id === this.props.params.id) {
                    playlist = this.props.playlists[i];
                    break;
                }
            }

            content = (
                <div className='view view-playlists'>
                    <PlaylistsNav playlists={ this.props.playlists } />
                    { this.props.params.id !== null ? React.cloneElement(this.props.children, {
                        playlist : playlist,
                        trackPlayingID : this.props.trackPlayingID
                    }) : undefined }
                </div>
            );
        }

        return content;
    }
}

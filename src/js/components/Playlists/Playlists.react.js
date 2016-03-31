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

        var content;

        if(this.props.playlists === null) {
            content = (
                <div className='full-message'>
                    <p>Loading playlists</p>
                </div>
            );
        }
        else {
            content = (
                <div className='view view-playlists'>
                    <PlaylistsNav playlists={ this.props.playlists } />
                    { this.props.params.id !== null ? React.cloneElement(this.props.children, {
                        playlistId : this.props.params.id
                    }) : undefined }
                </div>
            );
        }

        return content;
    }
}

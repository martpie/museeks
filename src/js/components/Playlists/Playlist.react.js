import React, { Component } from 'react';



/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var content;

        return (
            <div className='playlist'>
                { this.props.playlistId }
            </div>
        );
    }
}

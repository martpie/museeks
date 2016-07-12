import React, { Component } from 'react';

import TracksList from '../Shared/TracksList.react.js'



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

        if(!!this.props.tracks && !!this.props.tracks.length && this.props.tracks.length > 0) {
            return (
                <div className='playlist'>
                    <TracksList
                        tracks={ this.props.tracks }
                        trackPlayingID={ this.props.trackPlayingID }
                    />
                </div>
            );
        } else {
            return (
                <div className='playlist'>
                    <div className='full-message'>
                        <p>Empty playlist</p>
                    </div>
                </div>
            );
        }
    }
}

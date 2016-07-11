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

        return (
            <div className='playlist'>
                <TracksList
                    tracks={ [] }
                    trackPlayingID={ this.props.trackPlayingID }
                />
            </div>
        );
    }
}

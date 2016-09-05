import React, { Component } from 'react';

import TracksList    from '../Shared/TracksList.react.js';
import FullViewMessage from '../Shared/FullViewMessage.react';
import { Link } from 'react-router';


/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

export default class Playlist extends Component {

    static propTypes = {
        params: React.PropTypes.object,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
    }

    constructor(props) {

        super(props);
    }

    render() {

        if(Array.isArray(this.props.tracks) && this.props.tracks.length > 0) {
            return (
                <TracksList
                    type='playlist'
                    currentPlaylist={ this.props.params.playlistId }
                    tracks={ this.props.tracks }
                    trackPlayingId={ this.props.trackPlayingId }
                    playlists={ this.props.playlists }
                />
            );
        }

        return (
            <FullViewMessage>
                <p>Empty playlist</p>
                <p className='sub-message'>You can add tracks from the <Link to='/library'>library view</Link></p>
            </FullViewMessage>
        );
    }
}

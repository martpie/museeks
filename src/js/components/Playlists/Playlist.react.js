import React, { Component } from 'react';

import EmptyPlaylist from './EmptyPlaylist.react';
import TracksList    from '../Shared/TracksList.react.js';


/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

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

        return <EmptyPlaylist />;
    }
}

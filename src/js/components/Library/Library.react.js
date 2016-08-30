import React, { Component } from 'react';
import { Link } from 'react-router';

import FullViewMessage from '../Shared/FullViewMessage.react';
import TracksList from '../Shared/TracksList.react';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

export default class Library extends Component {

    static propTypes = {
        library: React.PropTypes.array,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array
    }

    constructor(props) {

        super(props);
    }

    getLibraryComponent() {

        // Loading library
        if(this.props.library === null) {
            return (
                <FullViewMessage>
                    <p>Loading library...</p>
                </FullViewMessage>
            );
        }

        // Empty library
        if (this.props.library.length === 0) {
            return (
                <FullViewMessage>
                    <p>Too bad, there is no music in your library =(</p>
                    <p className='sub-message'>
                        <span>nothing found yet, but that's fine, you can always </span>
                        <Link to='/settings/library'>add your music here</Link>
                    </p>
                </FullViewMessage>
            );
        }

        // Empty search
        if (this.props.tracks.length === 0) {
            return (
                <FullViewMessage>
                    <p>Your search returned no results</p>
                </FullViewMessage>
            );
        }

        // All good !
        return (
            <TracksList
                type='library'
                tracks={ this.props.tracks }
                trackPlayingId={ this.props.trackPlayingId }
                playlists={ this.props.playlists }
            />
        );
    }

    render() {
        return (
            <div className='view view-library' >
                { this.getLibraryComponent() }
            </div>
        );
    }
}

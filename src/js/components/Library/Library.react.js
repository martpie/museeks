import React, { Component } from 'react';

import EmptyLibrary from './EmptyLibrary.react';
import NewLibrary from './NewLibrary.react';

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
        this.state = {};
    }

    getLibraryComponent() {
        if(this.props.library === null) {
            return <EmptyLibrary message='Loading library...' />;
        }
        if (this.props.library.length === 0) {
            return <NewLibrary />;
        }
        if (this.props.tracks.length === 0) {
            return <EmptyLibrary message='Your search returned no results' />;
        }
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

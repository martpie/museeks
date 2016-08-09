import React, { Component } from 'react';
import { Link } from 'react-router';

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

    render() {

        let content;

        if(this.props.library === null) {
            content = (
                <div className='full-message'>
                    <p>Loading library...</p>
                </div>
            );
        } else if (this.props.library.length === 0) {
            content = (
                <div className='full-message'>
                    <p>Too bad, there is no music in your library =(</p>
                    <p className='sub-message'>nothing found yet, but that's fine, you can always <Link to='/settings/library'>add your music here</Link></p>
                </div>
            );
        } else if (this.props.tracks.length === 0) {
            content = (
                <div className='full-message'>
                    <p>Your search returned no results</p>
                </div>
            );
        } else {
            content = (
                <TracksList
                    type='library'
                    tracks={ this.props.tracks }
                    trackPlayingId={ this.props.trackPlayingId }
                    playlists={ this.props.playlists }
                />
            );
        }

        return (
            <div className='view view-library' >
                { content }
            </div>
        );
    }
}

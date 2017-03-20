import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import FullViewMessage from '../Shared/FullViewMessage.react';
import TracksList from '../Shared/TracksList.react';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

class Library extends Component {

    static propTypes = {
        library: React.PropTypes.array,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        playerStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.props.setTracksCursor('library');
    }

    getLibraryComponent = () => {
        // Loading library
        if (this.props.library === null) {
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
                playerStatus={ this.props.playerStatus }
                tracks={ this.props.tracks }
                trackPlayingId={ this.props.trackPlayingId }
                playlists={ this.props.playlists }
            />
        );
    }

    render = () => {
        return (
            <div className='view view-library' >
                { this.getLibraryComponent() }
            </div>
        );
    }
}

const stateToProps = (state) => ({});

const dispatchToProps = {
    setTracksCursor: lib.actions.library.setTracksCursor
};

export default connect(stateToProps, dispatchToProps)(Library);

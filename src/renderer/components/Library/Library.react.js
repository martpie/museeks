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
        columns: React.PropTypes.object,
        library: React.PropTypes.array,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        playStatus: React.PropTypes.string,
        setTracksCursor: React.PropTypes.func,
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
                columns={ this.props.columns }
                playStatus={ this.props.playStatus }
                tracks={ this.props.tracks }
                trackPlayingId={ this.props.trackPlayingId }
                playlists={ this.props.playlists }
                setColumnWidth={ this.props.setColumnWidth }
                toggleSort={ this.props.toggleSort }
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

const stateToProps = () => ({});

const dispatchToProps = {
    setTracksCursor: lib.actions.tracks.setTracksCursor,
    setColumnWidth: lib.actions.tracks.setColumnWidth,
    toggleSort: lib.actions.tracks.toggleSort,
};

export default connect(stateToProps, dispatchToProps)(Library);

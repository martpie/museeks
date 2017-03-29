import React, { Component } from 'react';
import { connect } from 'react-redux';

import TracksList    from '../Shared/TracksList.react.js';
import FullViewMessage from '../Shared/FullViewMessage.react';
import { Link } from 'react-router';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

class Playlist extends Component {

    static propTypes = {
        params: React.PropTypes.object,
        tracks: React.PropTypes.array,
        columns: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        playStatus: React.PropTypes.string,
        load: React.PropTypes.func,
        setTracksCursor: React.PropTypes.func
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.props.load(this.props.params.playlistId);
        this.props.setTracksCursor('playlist');
    }

    componentWillReceiveProps = (newProps) => {
        const oldProps = this.props;
        if (oldProps.params.playlistId !== newProps.params.playlistId) {
            this.props.load(newProps.params.playlistId);
        }
    }

    render() {
        if (Array.isArray(this.props.tracks) && this.props.tracks.length > 0) {
            return (
                <TracksList
                    type='playlist'
                    columns={ this.props.columns }
                    currentPlaylist={ this.props.params.playlistId }
                    tracks={ this.props.tracks }
                    trackPlayingId={ this.props.trackPlayingId }
                    playlists={ this.props.playlists }
                    playStatus={ this.props.playStatus }
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

const stateToProps = () => ({});

const dispatchToProps = {
    load: lib.actions.playlists.load,
    setTracksCursor: lib.actions.tracks.setTracksCursor
};

export default connect(stateToProps, dispatchToProps)(Playlist);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import TracksList from '../Shared/TracksList.react';
import FullViewMessage from '../Shared/FullViewMessage.react';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import { filterTracks } from '../../utils/utils-library';


/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

class Playlist extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    tracks: PropTypes.array.isRequired,
    trackPlayingId: PropTypes.string.isRequired,
    playlists: PropTypes.array.isRequired,
    playerStatus: PropTypes.string.isRequired,
  }

  componentDidMount() {
    PlaylistsActions.load(this.props.match.params.playlistId);
  }

  componentWillReceiveProps(nextProps) {
    const { playlistId } = this.props.match.params;
    const nextPlaylistId = nextProps.match.params.playlistId;

    if (nextPlaylistId !== playlistId) {
      PlaylistsActions.load(nextPlaylistId);
    }
  }

  render() {
    const {
      tracks, trackPlayingId, playerStatus, playlists, match,
    } = this.props;

    if (Array.isArray(tracks) && tracks.length > 0) {
      return (
        <TracksList
          type="playlist"
          playerStatus={playerStatus}
          tracks={tracks}
          trackPlayingId={trackPlayingId}
          playlists={playlists}
          currentPlaylist={match.params.playlistId}
        />
      );
    }

    return (
      <FullViewMessage>
        <p>Empty playlist</p>
        <p className="sub-message">You can add tracks from the <Link to="/library">library view</Link></p>
      </FullViewMessage>
    );
  }
}

const mapStateToProps = ({ library, playlists, player }) => {
  const { search, tracks } = library;
  const filteredTracks = filterTracks(tracks.playlist, search);

  return {
    playlists,
    tracks: filteredTracks,
    playerStatus: player.playerStatus,
    trackPlayingId: (player.queue.length > 0 && player.queueCursor !== null) ? player.queue[player.queueCursor]._id : null,
  };
};

export default connect(mapStateToProps)(Playlist);

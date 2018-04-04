import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TracksList    from '../Shared/TracksList.react.js';
import FullViewMessage from '../Shared/FullViewMessage.react';
import { Link } from 'react-router-dom';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import { filterTracks } from '../../utils/utils-library';


/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

class Playlist extends Component {
  static propTypes = {
    match: PropTypes.object,
    tracks: PropTypes.array,
    trackPlayingId: PropTypes.string,
    playlists: PropTypes.array,
    playerStatus: PropTypes.string,
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    PlaylistsActions.load(this.props.match.params.playlistId);
  }

  componentWillReceiveProps(nextProps) {
    const playlistId = this.props.match.params.playlistId;
    const nextPlaylistId = nextProps.match.params.playlistId;

    if (nextPlaylistId !== playlistId) {
      PlaylistsActions.load(nextPlaylistId);
    }
  }

  render() {
    const { tracks, trackPlayingId, playerStatus, playlists, match } = this.props;

    if(Array.isArray(tracks) && tracks.length > 0) {
      return (
        <TracksList
          type='playlist'
          currentPlaylist={match.params.playlistId}
          tracks={tracks}
          trackPlayingId={trackPlayingId}
          playlists={playlists}
          playerStatus={playerStatus}
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

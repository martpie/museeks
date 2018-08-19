import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import TracksList from '../Shared/TracksList';
import FullViewMessage from '../Shared/FullViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import { filterTracks } from '../../utils/utils-library';
import { TrackModel, PlaylistModel, PlayerStatus } from '../../typings/interfaces';
import { RootState } from '../../reducers';

/*
|--------------------------------------------------------------------------
| Playlist
|--------------------------------------------------------------------------
*/

interface OwnProps {
  tracks: TrackModel[];
  trackPlayingId: string | null;
  playlists: PlaylistModel[];
  playerStatus: PlayerStatus;
}

interface RouteParams {
  playlistId: string;
}

type Props = OwnProps & RouteComponentProps<RouteParams>;

class Playlist extends React.Component<Props> {
  async componentDidMount () {
    await PlaylistsActions.load(this.props.match.params.playlistId);
  }

  async componentWillReceiveProps (nextProps: Props) {
    const { playlistId } = this.props.match.params;
    const nextPlaylistId = nextProps.match.params.playlistId;

    if (nextPlaylistId !== playlistId) {
      await PlaylistsActions.load(nextPlaylistId);
    }
  }

  render () {
    const {
      tracks, trackPlayingId, playerStatus, playlists, match
    } = this.props;

    if (Array.isArray(tracks) && tracks.length > 0) {
      return (
        <TracksList
          type='playlist'
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
        <p className='sub-message'>You can add tracks from the <Link to='/library'>library view</Link></p>
      </FullViewMessage>
    );
  }
}

const mapStateToProps = ({ library, playlists, player }: RootState) => {
  const { search, tracks } = library;
  const filteredTracks = filterTracks(tracks.playlist, search);

  return {
    playlists,
    tracks: filteredTracks,
    playerStatus: player.playerStatus,
    trackPlayingId: (player.queue.length > 0 && player.queueCursor !== null) ? player.queue[player.queueCursor]._id : null
  };
};

export default connect(mapStateToProps)(Playlist);

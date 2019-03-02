import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import TracksList from '../TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import { filterTracks } from '../../utils/utils-library';
import { TrackModel, PlaylistModel, PlayerStatus } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';

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

  onReorder = async (
    playlistId: string,
    tracksIds: string[],
    targetTrackId: string,
    position: 'above' | 'below'
  ) => {
    await PlaylistsActions.reorderTracks(playlistId, tracksIds, targetTrackId, position);
  }

  render () {
    const {
      tracks, trackPlayingId, playerStatus, playlists, match
    } = this.props;

    // A bit hacky though, maybe this should be in mapstatetoprops
    const currentPlaylist = playlists.find(p => p._id === match.params.playlistId);

    if (currentPlaylist && currentPlaylist.tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Empty playlist</p>
          <ViewMessage.Sub>
            You can add tracks from the <Link to='/library' draggable={false}>library view</Link>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    if (tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Your search returned no results</p>
        </ViewMessage.Notice>
      );
    }

    // A bit hacky though
    if (currentPlaylist && currentPlaylist.tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Empty playlist</p>
          <ViewMessage.Sub>
            You can add tracks from the <Link to='/library' draggable={false}>library view</Link>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    return (
      <TracksList
        type='playlist'
        reorderable={true}
        onReorder={this.onReorder}
        playerStatus={playerStatus}
        tracks={tracks}
        trackPlayingId={trackPlayingId}
        playlists={playlists}
        currentPlaylist={match.params.playlistId}
      />
    );
  }
}

const mapStateToProps = ({ library, playlists, player }: RootState) => {
  const { search, tracks } = library;
  const filteredTracks = filterTracks(tracks.playlist, search);

  return {
    playlists: playlists.list,
    tracks: filteredTracks,
    playerStatus: player.playerStatus,
    trackPlayingId: (player.queue.length > 0 && player.queueCursor !== null) ? player.queue[player.queueCursor]._id : null
  };
};

export default connect(mapStateToProps)(Playlist);

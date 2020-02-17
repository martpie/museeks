import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import TracksList from '../TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import { filterTracks } from '../../utils/utils-library';
import { TrackModel, PlaylistModel, PlayerStatus } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';

type OwnProps = RouteComponentProps<RouteParams>;

interface ReduxProps {
  tracks: TrackModel[];
  trackPlayingId: string | null;
  playlists: PlaylistModel[];
  currentPlaylist: PlaylistModel | undefined;
  playerStatus: PlayerStatus;
}

interface RouteParams {
  playlistId: string;
}

type Props = ReduxProps & OwnProps;

class Playlist extends React.Component<Props> {
  async componentDidMount() {
    await PlaylistsActions.load(this.props.match.params.playlistId);
  }

  async componentDidUpdate(prevProps: Props) {
    const playlistId = this.props.match.params.playlistId;

    if (playlistId !== prevProps.match.params.playlistId) {
      PlaylistsActions.load(playlistId);
    }
  }

  onReorder = async (playlistId: string, tracksIds: string[], targetTrackId: string, position: 'above' | 'below') => {
    await PlaylistsActions.reorderTracks(playlistId, tracksIds, targetTrackId, position);
  };

  render() {
    const { tracks, trackPlayingId, playerStatus, playlists, currentPlaylist, match } = this.props;

    if (currentPlaylist && currentPlaylist.tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Empty playlist</p>
          <ViewMessage.Sub>
            You can add tracks from the{' '}
            <Link to='/library' draggable={false}>
              library view
            </Link>
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
            You can add tracks from the{' '}
            <Link to='/library' draggable={false}>
              library view
            </Link>
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

const mapStateToProps = ({ library, playlists, player }: RootState, ownProps: OwnProps): ReduxProps => {
  const { search, tracks } = library;
  const filteredTracks = filterTracks(tracks.playlist, search);

  const currentPlaylist = playlists.list.find((p) => p._id === ownProps.match.params.playlistId);

  return {
    playlists: playlists.list,
    currentPlaylist,
    tracks: filteredTracks,
    playerStatus: player.playerStatus,
    trackPlayingId: player.queue.length > 0 && player.queueCursor !== null ? player.queue[player.queueCursor]._id : null
  };
};

export default connect(mapStateToProps)(Playlist);

import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import TracksList from '../TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';

import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import { filterTracks } from '../../lib/utils-library';
import { RootState } from '../../store/reducers';

const Playlist: React.FC = () => {
  const params = useParams();
  const playlistId = params.playlistId;

  const { tracks, trackPlayingId, playerStatus, playlists, currentPlaylist, search } = useSelector(
    (state: RootState) => {
      const { library, player, playlists } = state;

      const { search, tracks } = library;
      const filteredTracks = filterTracks(tracks.playlist, search);

      const currentPlaylist = playlists.list.find((p) => p._id === playlistId);

      return {
        playlists: playlists.list,
        currentPlaylist,
        tracks: filteredTracks,
        playerStatus: player.playerStatus,
        trackPlayingId:
          player.queue.length > 0 && player.queueCursor !== null ? player.queue[player.queueCursor]._id : null,
        search: library.search,
      };
    }
  );

  useEffect(() => {
    if (playlistId) {
      PlaylistsActions.load(playlistId);
    }
  }, [playlistId]);

  const onReorder = useCallback(
    (playlistId: string, tracksIds: string[], targetTrackId: string, position: 'above' | 'below') => {
      PlaylistsActions.reorderTracks(playlistId, tracksIds, targetTrackId, position);
    },
    []
  );

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
    if (search.length > 0) {
      return (
        <ViewMessage.Notice>
          <p>Your search returned no results</p>
        </ViewMessage.Notice>
      );
    }

    // VERY sketchy
    return (
      <ViewMessage.Notice>
        <p>Loading playlist...</p>
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
      onReorder={onReorder}
      playerStatus={playerStatus}
      tracks={tracks}
      trackPlayingId={trackPlayingId}
      playlists={playlists}
      currentPlaylist={playlistId}
    />
  );
};

export default Playlist;

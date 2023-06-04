import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';

import TracksList from '../../components/TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import { filterTracks } from '../../lib/utils-library';
import { RootState } from '../../store/reducers';
import usePlayerStore from '../../stores/usePlayerStore';

export default function Playlist() {
  const params = useParams();
  const playlistId = params.playlistId;

  const trackPlayingId = usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });

  const { tracks, playlists, currentPlaylist, search } = useSelector((state: RootState) => {
    const { library, playlists } = state;

    const { search, tracks } = library;
    const filteredTracks = filterTracks(tracks.playlist, search);

    const currentPlaylist = playlists.list.find((p) => p._id === playlistId);

    return {
      playlists: playlists.list,
      currentPlaylist,
      tracks: filteredTracks,
      search: library.search,
    };
  });

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
      tracks={tracks}
      trackPlayingId={trackPlayingId}
      playlists={playlists}
      currentPlaylist={playlistId}
    />
  );
}

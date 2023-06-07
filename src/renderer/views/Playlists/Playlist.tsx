import { useCallback, useMemo } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';

import TracksList from '../../components/TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import * as PlaylistsActions from '../../stores/PlaylistsActions';
import { filterTracks } from '../../lib/utils-library';
import usePlayerStore from '../../stores/usePlayerStore';
import { PlaylistLoaderResponse } from '../router';
import useLibraryStore from '../../stores/useLibraryStore';

export default function Playlist() {
  const { playlists, playlistTracks } = useLoaderData() as PlaylistLoaderResponse;
  const { playlistId } = useParams();

  const trackPlayingId = usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useMemo(() => filterTracks(playlistTracks, search), [playlistTracks, search]);

  const onReorder = useCallback(
    (playlistId: string, tracksIds: string[], targetTrackId: string, position: 'above' | 'below') => {
      PlaylistsActions.reorderTracks(playlistId, tracksIds, targetTrackId, position);
    },
    []
  );

  if (playlistTracks.length === 0) {
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

  if (filteredTracks.length === 0 && search.length > 0) {
    return (
      <ViewMessage.Notice>
        <p>Your search returned no results</p>
      </ViewMessage.Notice>
    );
  }

  // A bit hacky though
  if (filteredTracks && filteredTracks.length === 0) {
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
      tracks={playlistTracks}
      trackPlayingId={trackPlayingId}
      playlists={playlists}
      currentPlaylist={playlistId}
    />
  );
}

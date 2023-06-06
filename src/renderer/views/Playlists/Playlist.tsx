import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLoaderData, useParams } from 'react-router-dom';

import TracksList from '../../components/TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import { filterTracks } from '../../lib/utils-library';
import { RootState } from '../../store/reducers';
import usePlayerStore from '../../stores/usePlayerStore';
import { PlaylistLoaderType } from '../router';

export default function Playlist() {
  const { playlists, playlistTracks } = useLoaderData() as PlaylistLoaderType;
  const { playlistId } = useParams();

  const trackPlayingId = usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });

  const { search } = useSelector((state: RootState) => {
    return {
      search: state.library.search,
    };
  });

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

  if (filteredTracks.length === 0) {
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

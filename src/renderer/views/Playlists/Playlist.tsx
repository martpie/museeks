import { useCallback, useMemo } from 'react';
import {
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
} from 'react-router-dom';

import TracksList from '../../components/TracksList/TracksList';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import PlaylistsAPI from '../../stores/PlaylistsAPI';
import { filterTracks } from '../../lib/utils-library';
import { LoaderResponse } from '../router';
import useLibraryStore from '../../stores/useLibraryStore';
import useTrackPlayingID from '../../hooks/useTrackPlayingID';
import { PlaylistModel, TrackModel } from '../../../shared/types/museeks';

const { db } = window.MuseeksAPI;

export default function PlaylistView() {
  const { playlists, playlistTracks } =
    useLoaderData() as PlaylistLoaderResponse;
  const { playlistId } = useParams();
  const trackPlayingId = useTrackPlayingID();

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useMemo(
    () => filterTracks(playlistTracks, search),
    [playlistTracks, search],
  );

  const onReorder = useCallback(
    (
      playlistId: string,
      tracksIds: string[],
      targetTrackId: string,
      position: 'above' | 'below',
    ) => {
      PlaylistsAPI.reorderTracks(
        playlistId,
        tracksIds,
        targetTrackId,
        position,
      );
    },
    [],
  );

  if (playlistTracks.length === 0) {
    return (
      <ViewMessage.Notice>
        <p>Empty playlist</p>
        <ViewMessage.Sub>
          You can add tracks from the{' '}
          <Link to="/library" draggable={false}>
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
          <Link to="/library" draggable={false}>
            library view
          </Link>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  }

  return (
    <TracksList
      type="playlist"
      reorderable={true}
      onReorder={onReorder}
      tracks={playlistTracks}
      trackPlayingId={trackPlayingId}
      playlists={playlists}
      currentPlaylist={playlistId}
    />
  );
}

export type PlaylistLoaderResponse = {
  playlistTracks: TrackModel[];
  playlists: PlaylistModel[];
};

PlaylistView.loader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderResponse<PlaylistLoaderResponse>> => {
  if (typeof params.playlistId !== 'string') {
    throw new Error('Playlist ID is not defined');
  }

  const playlist = await db.playlists.findOnlyByID(params.playlistId);
  return {
    // TODO: can we re-use parent's data?
    playlists: await db.playlists.getAll(),
    playlistTracks: await db.tracks.findByID(playlist.tracks),
  };
};

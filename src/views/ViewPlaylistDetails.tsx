import { useCallback, useMemo } from 'react';
import {
  Link,
  LoaderFunctionArgs,
  useLoaderData,
  useParams,
} from 'react-router-dom';

import TracksList from '../components/TracksList/TracksList';
import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import { filterTracks } from '../lib/utils-library';
import useLibraryStore from '../stores/useLibraryStore';
import usePlayingTrackID from '../hooks/usePlayingTrackID';

import { LoaderData } from './router';

const { db, config } = window.MuseeksAPI;

export default function ViewPlaylistDetails() {
  const { playlists, playlistTracks, tracksDensity } =
    useLoaderData() as PlaylistLoaderData;
  const { playlistID } = useParams();
  const trackPlayingID = usePlayingTrackID();

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useMemo(
    () => filterTracks(playlistTracks, search),
    [playlistTracks, search],
  );

  const onReorder = useCallback(
    (
      playlistID: string,
      tracksIDs: string[],
      targetTrackID: string,
      position: 'above' | 'below',
    ) => {
      PlaylistsAPI.reorderTracks(
        playlistID,
        tracksIDs,
        targetTrackID,
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
      tracksDensity={tracksDensity}
      trackPlayingID={trackPlayingID}
      playlists={playlists}
      currentPlaylist={playlistID}
    />
  );
}

export type PlaylistLoaderData = LoaderData<typeof ViewPlaylistDetails.loader>;

ViewPlaylistDetails.loader = async ({ params }: LoaderFunctionArgs) => {
  if (typeof params.playlistID !== 'string') {
    throw new Error('Playlist ID is not defined');
  }

  const playlist = await db.playlists.findOnlyByID(params.playlistID);

  return {
    // TODO: can we re-use parent's data?
    playlists: await db.playlists.getAll(),
    playlistTracks: await db.tracks.findByID(playlist.tracks),
    tracksDensity: await config.get('tracksDensity'),
  };
};

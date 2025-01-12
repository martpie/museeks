import { useCallback } from 'react';
import {
  Link,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useParams,
} from 'react-router';

import TracksList from '../components/TracksList';
import * as ViewMessage from '../elements/ViewMessage';
import type { Track } from '../generated/typings';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useInvalidate from '../hooks/useInvalidate';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import config from '../lib/config';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import useLibraryStore from '../stores/useLibraryStore';
import type { LoaderData } from '../types/syncudio';

export default function ViewPlaylistDetails() {
  const { playlists, playlistTracks, tracksDensity } =
    useLoaderData() as PlaylistLoaderData;
  const { playlistID } = useParams();
  const trackPlayingID = usePlayingTrackID();

  const invalidate = useInvalidate();

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useFilteredTracks(playlistTracks);

  const onReorder = useCallback(
    async (tracks: Track[]) => {
      if (playlistID != null) {
        await PlaylistsAPI.reorderTracks(playlistID, tracks);
        invalidate();
      }
    },
    [invalidate, playlistID],
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
      tracks={filteredTracks}
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

  try {
    const playlist = await database.getPlaylist(params.playlistID);
    return {
      playlists: await database.getAllPlaylists(),
      playlistTracks: await database.getTracks(playlist.tracks),
      tracksDensity: await config.get('track_view_density'),
    };
  } catch (err) {
    if (err === 'Playlist not found') {
      return redirect('/playlists');
    }

    throw err;
  }
};

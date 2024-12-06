import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback } from 'react';

import TracksList from '../components/TracksList';
import * as ViewMessage from '../elements/ViewMessage';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useInvalidate from '../hooks/useInvalidate';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import config from '../lib/config';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import useLibraryStore from '../stores/useLibraryStore';

export const Route = createFileRoute('/playlists/$playlistID')({
  component: ViewPlaylistDetails,
  loader: async function loader({ params }) {
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
        throw redirect({ to: '/playlists' });
      }

      throw err;
    }
  },
});

export default function ViewPlaylistDetails() {
  const { playlists, playlistTracks, tracksDensity } = Route.useLoaderData();
  const { playlistID } = Route.useParams();
  const trackPlayingID = usePlayingTrackID();

  const invalidate = useInvalidate();

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useFilteredTracks(playlistTracks);

  const onReorder = useCallback(
    async (
      playlistID: string,
      tracksIDs: Set<string>,
      targetTrackID: string,
      position: 'above' | 'below',
    ) => {
      await PlaylistsAPI.reorderTracks(
        playlistID,
        Array.from(tracksIDs),
        targetTrackID,
        position,
      );
      invalidate();
    },
    [invalidate],
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

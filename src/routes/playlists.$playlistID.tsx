import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import TracksList from '../components/TracksList';
import * as ViewMessage from '../elements/ViewMessage';
import type { Track } from '../generated/typings';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useInvalidate from '../hooks/useInvalidate';
import config from '../lib/config';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import useLibraryStore from '../stores/useLibraryStore';

export const Route = createFileRoute('/playlists/$playlistID')({
  component: ViewPlaylistDetails,
  loader: async ({ params }) => {
    try {
      const playlist = await database.getPlaylist(params.playlistID);

      const [playlists, playlistTracks, tracksDensity] = await Promise.all([
        database.getAllPlaylists(),
        database.getTracks(playlist.tracks),
        config.get('track_view_density'),
      ]);

      return {
        playlists,
        playlistTracks,
        tracksDensity,
      };
    } catch (err) {
      if (err === 'Playlist not found') {
        throw redirect({ to: '/playlists' });
      }

      throw err;
    }
  },
});

function ViewPlaylistDetails() {
  const { playlists, playlistTracks, tracksDensity } = Route.useLoaderData();
  const { playlistID } = Route.useParams();

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

  const extraContextMenu = useMemo(() => {
    return [
      {
        label: 'Remove from playlist',
        action: async (selectedTracks: Set<string>) => {
          await PlaylistsAPI.removeTracks(
            playlistID,
            Array.from(selectedTracks),
          );
          invalidate();
        },
      },
    ];
  }, [playlistID, invalidate]);

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
      layout="default"
      isSortEnabled={false}
      tracks={filteredTracks}
      tracksDensity={tracksDensity}
      playlists={playlists}
      currentPlaylistID={playlistID}
      onReorder={onReorder}
      reorderable={true}
      extraContextMenu={extraContextMenu}
    />
  );
}

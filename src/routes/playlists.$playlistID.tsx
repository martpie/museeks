import { Trans, useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Link,
  redirect,
  useLoaderData,
} from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import TracksList from '../components/TracksList';
import * as ViewMessage from '../elements/ViewMessage';
import type { Track } from '../generated/typings';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import useInvalidate from '../hooks/useInvalidate';
import config from '../lib/config';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import useLibraryStore from '../stores/useLibraryStore';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/playlists/$playlistID')({
  component: ViewPlaylistDetails,
  loader: async ({ params }) => {
    try {
      const playlist = await database.getPlaylist(params.playlistID);

      const [playlistTracks, tracksDensity] = await Promise.all([
        database.getTracks(playlist.tracks),
        config.get('track_view_density'),
      ]);

      return {
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
  const { playlistTracks, tracksDensity } = Route.useLoaderData();
  const { playlists } = useLoaderData({ from: '/playlists' });
  const { playlistID } = Route.useParams();
  const { t } = useLingui();

  const invalidate = useInvalidate();

  const search = useLibraryStore((state) => state.search);
  const filteredTracks = useFilteredTracks(playlistTracks);
  useGlobalTrackListStatus(filteredTracks);

  const queueOrigin = useMemo(() => {
    return { type: 'playlist', playlistID } satisfies QueueOrigin;
  }, [playlistID]);

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
        label: t`Remove from playlist`,
        action: async (selectedTracks: Set<string>) => {
          await PlaylistsAPI.removeTracks(
            playlistID,
            Array.from(selectedTracks),
          );
          invalidate();
        },
      },
    ];
  }, [playlistID, invalidate, t]);

  if (playlistTracks.length === 0) {
    return (
      <ViewMessage.Notice>
        <p>
          <Trans>Empty playlist</Trans>
        </p>
        <ViewMessage.Sub>
          <Trans>
            You can add tracks from the{' '}
            <Link to="/library" draggable={false}>
              library view
            </Link>
          </Trans>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  }

  if (filteredTracks.length === 0 && search.length > 0) {
    return (
      <ViewMessage.Notice>
        <p>
          <Trans>Your search returned no results</Trans>
        </p>
      </ViewMessage.Notice>
    );
  }

  // A bit hacky though
  if (filteredTracks && filteredTracks.length === 0) {
    return (
      <ViewMessage.Notice>
        <p>
          <Trans>Empty playlist</Trans>
        </p>
        <ViewMessage.Sub>
          <Trans>
            You can add tracks from the{' '}
            <Link to="/library" draggable={false}>
              library view
            </Link>
          </Trans>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  }

  return (
    <TracksList
      layout="default"
      isSortEnabled={false}
      data={filteredTracks}
      tracksDensity={tracksDensity}
      playlists={playlists}
      queueOrigin={queueOrigin}
      onReorder={onReorder}
      reorderable={true}
      extraContextMenu={extraContextMenu}
    />
  );
}

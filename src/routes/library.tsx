import { Trans } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import config from '../lib/config';
import database from '../lib/database';
import queryClient from '../lib/query-client';
import useLibraryStore from '../stores/useLibraryStore';
import type { QueueOrigin } from '../types/museeks';

const QUERY_ALL_TRACKS = 'all_tracks';
const QUEUE_ORIGIN: QueueOrigin = { type: 'library' };

export const Route = createFileRoute('/library')({
  component: ViewLibrary,
  loader: async () => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_ALL_TRACKS],
      queryFn: database.getAllTracks,
    });

    const [playlists, tracksDensity] = await Promise.all([
      database.getAllPlaylists(),
      config.get('track_view_density'),
    ]);

    return {
      playlists,
      tracksDensity,
    };
  },
});

function ViewLibrary() {
  const refreshing = useLibraryStore((state) => state.refreshing);
  const search = useLibraryStore((state) => state.search);
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);

  const { playlists, tracksDensity } = Route.useLoaderData();

  // Some queries when switching routes can be expensive-ish (like getting all tracks),
  // while at the same time, the data will most of the time never change.
  // Using stale-while-revalidate libraries help us (fake-)loading this page faster
  const { data: tracks, isLoading } = useQuery({
    queryKey: [QUERY_ALL_TRACKS],
    queryFn: database.getAllTracks,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredTracks = useFilteredTracks(tracks ?? [], sortBy, sortOrder);
  useGlobalTrackListStatus(filteredTracks);

  const content = useMemo(() => {
    // Refreshing library
    if (isLoading) {
      return (
        <ViewMessage.Notice>
          <p>
            <Trans>Loading library...</Trans>
          </p>
        </ViewMessage.Notice>
      );
    }

    // Refreshing library
    if (refreshing) {
      return (
        <ViewMessage.Notice>
          <p>
            <Trans>Your library is being scanned =)</Trans>
          </p>
          <ViewMessage.Sub>
            <Trans>hold on...</Trans>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    // Empty library
    if (filteredTracks.length === 0 && search === '') {
      return (
        <ViewMessage.Notice>
          <p>
            <Trans>There is no music in your library :(</Trans>
          </p>
          <ViewMessage.Sub>
            <Trans>
              you can{' '}
              <Link to="/settings/library" draggable={false}>
                add your music here
              </Link>
            </Trans>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    // Empty search
    if (filteredTracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>
            <Trans>Your search returned no results</Trans>
          </p>
        </ViewMessage.Notice>
      );
    }

    // All good !
    return (
      <TrackList
        layout="default"
        data={filteredTracks}
        queueOrigin={QUEUE_ORIGIN}
        tracksDensity={tracksDensity}
        playlists={playlists}
        isSortEnabled={true}
      />
    );
  }, [search, refreshing, filteredTracks, playlists, tracksDensity, isLoading]);

  return <View>{content}</View>;
}

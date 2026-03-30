import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import View from '../elements/View';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import { allTracksQuery, librarySortQuery } from '../lib/queries';
import queryClient from '../lib/query-client';
import type { QueueOrigin } from '../types/museeks';

const QUEUE_ORIGIN: QueueOrigin = { type: 'library' };

export const Route = createFileRoute('/library')({
  component: ViewLibrary,
  loader: async () => {
    const [_, __, playlists, tracksDensity] = await Promise.all([
      queryClient.prefetchQuery(allTracksQuery),
      queryClient.prefetchQuery(librarySortQuery),
      DatabaseBridge.getAllPlaylists(),
      ConfigBridge.get('track_view_density'),
    ]);

    return {
      playlists,
      tracksDensity,
    };
  },
});

function ViewLibrary() {
  const { playlists, tracksDensity } = Route.useLoaderData();

  const { data: sort } = useQuery(librarySortQuery);

  // Some queries when switching routes can be expensive-ish (like getting all tracks),
  // while at the same time, the data will most of the time never change.
  // Using stale-while-revalidate libraries help us (fake-)loading this page faster
  const { data: tracks, isLoading } = useQuery(allTracksQuery);

  const filteredTracks = useFilteredTracks(
    tracks ?? [],
    sort?.sortBy,
    sort?.sortOrder,
  );
  useGlobalTrackListStatus(filteredTracks);

  return (
    <View>
      <TrackListStates isLoading={isLoading} tracks={filteredTracks}>
        <TrackList
          layout="default"
          data={filteredTracks}
          queueOrigin={QUEUE_ORIGIN}
          tracksDensity={tracksDensity}
          playlists={playlists}
        />
      </TrackListStates>
    </View>
  );
}

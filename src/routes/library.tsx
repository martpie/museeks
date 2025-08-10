import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import View from '../elements/View';
import useFilteredTracks from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
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
      queryFn: DatabaseBridge.getAllTracks,
    });

    const [playlists, tracksDensity] = await Promise.all([
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
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);

  const { playlists, tracksDensity } = Route.useLoaderData();

  // Some queries when switching routes can be expensive-ish (like getting all tracks),
  // while at the same time, the data will most of the time never change.
  // Using stale-while-revalidate libraries help us (fake-)loading this page faster
  const { data: tracks, isLoading } = useQuery({
    queryKey: [QUERY_ALL_TRACKS],
    queryFn: DatabaseBridge.getAllTracks,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredTracks = useFilteredTracks(tracks ?? [], sortBy, sortOrder);
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
          isSortEnabled={true}
        />
      </TrackListStates>
    </View>
  );
}

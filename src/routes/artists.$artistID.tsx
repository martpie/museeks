import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/artists/$artistID')({
  component: ViewArtistDetails,
  loader: async ({ params }) => {
    const [albums, playlists, tracksDensity] = await Promise.all([
      DatabaseBridge.getArtistTracks(params.artistID),
      DatabaseBridge.getAllPlaylists(),
      ConfigBridge.get('track_view_density'),
    ]);

    return {
      albums,
      playlists,
      tracksDensity,
    };
  },
});

export default function ViewArtistDetails() {
  const { albums, tracksDensity, playlists } = Route.useLoaderData();
  const { artistID } = Route.useParams();
  const content = useFilteredTrackGroup(albums);
  useGlobalTrackListStatus(content);

  const queueOrigin = useMemo(() => {
    return { type: 'artist', artistID } satisfies QueueOrigin;
  }, [artistID]);

  return (
    <TrackListStates isLoading={false} tracks={content}>
      <TrackList
        layout="grouped"
        data={content}
        tracksDensity={tracksDensity}
        playlists={playlists}
        queueOrigin={queueOrigin}
        isSortEnabled={false}
      />
    </TrackListStates>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/artists/presets/compilations')({
  component: ViewCompilations,
  loader: async () => {
    const [albums, playlists, tracksDensity] = await Promise.all([
      DatabaseBridge.getCompilationAlbums(),
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

export default function ViewCompilations() {
  const { albums, tracksDensity, playlists } = Route.useLoaderData();
  const content = useFilteredTrackGroup(albums);
  useGlobalTrackListStatus(content);

  const queueOrigin = useMemo(() => {
    return { type: 'compilations' } satisfies QueueOrigin;
  }, []);

  return (
    <TrackListStates isLoading={false} tracks={content}>
      <TrackList
        layout="grouped"
        data={content}
        tracksDensity={tracksDensity}
        playlists={playlists}
        queueOrigin={queueOrigin}
        isSortEnabled={false}
        showArtistInTitle={true}
      />
    </TrackListStates>
  );
}

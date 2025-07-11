import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import config from '../lib/config';
import database from '../lib/database';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/artists/$artistID')({
  component: ViewArtistDetails,
  loader: async ({ params }) => {
    const [albums, playlists, tracksDensity] = await Promise.all([
      database.getArtistTracks(params.artistID),
      database.getAllPlaylists(),
      config.get('track_view_density'),
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
    <TrackList
      layout="grouped"
      data={content}
      tracksDensity={tracksDensity}
      playlists={playlists}
      queueOrigin={queueOrigin}
      isSortEnabled={false}
    />
  );
}

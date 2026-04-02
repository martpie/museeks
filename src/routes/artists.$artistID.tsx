import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useFocusedAlbum, {
  validateFocusedAlbumSearch,
} from '../hooks/useFocusedAlbum';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import DatabaseBridge from '../lib/bridge-database';
import { configQuery } from '../lib/queries';
import type { QueueOrigin } from '../types/museeks';

export const Route = createFileRoute('/artists/$artistID')({
  component: ViewArtistDetails,
  loader: async ({ params }) => {
    const [albums, playlists] = await Promise.all([
      DatabaseBridge.getArtistTracks(params.artistID),
      DatabaseBridge.getAllPlaylists(),
    ]);

    return { albums, playlists };
  },
  validateSearch: validateFocusedAlbumSearch,
});

export default function ViewArtistDetails() {
  const { albums, playlists } = Route.useLoaderData();
  const config = useSuspenseQuery(configQuery).data;
  const { artistID } = Route.useParams();
  const content = useFilteredTrackGroup(albums);
  useGlobalTrackListStatus(content);

  const queueOrigin = useMemo(() => {
    return { type: 'artist', artistID } satisfies QueueOrigin;
  }, [artistID]);

  useFocusedAlbum(Route.useSearch().focused_album);

  return (
    <TrackListStates isLoading={false} tracks={content}>
      <TrackList
        layout="grouped"
        data={content}
        tracksDensity={config.track_view_density}
        playlists={playlists}
        queueOrigin={queueOrigin}
      />
    </TrackListStates>
  );
}

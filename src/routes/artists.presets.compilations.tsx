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

export const Route = createFileRoute('/artists/presets/compilations')({
  component: ViewCompilations,
  validateSearch: validateFocusedAlbumSearch,
  loader: async () => {
    const [albums, playlists] = await Promise.all([
      DatabaseBridge.getCompilationAlbums(),
      DatabaseBridge.getAllPlaylists(),
    ]);

    return { albums, playlists };
  },
});

export default function ViewCompilations() {
  const { albums, playlists } = Route.useLoaderData();
  const config = useSuspenseQuery(configQuery).data;
  const content = useFilteredTrackGroup(albums);
  useGlobalTrackListStatus(content);

  const queueOrigin = useMemo(() => {
    return { type: 'compilations' } satisfies QueueOrigin;
  }, []);

  useFocusedAlbum(Route.useSearch().focused_album);

  return (
    <TrackListStates isLoading={false} tracks={content}>
      <TrackList
        layout="grouped"
        data={content}
        tracksDensity={config.track_view_density}
        playlists={playlists}
        queueOrigin={queueOrigin}
        showArtistInTitle={true}
      />
    </TrackListStates>
  );
}

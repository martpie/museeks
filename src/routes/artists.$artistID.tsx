import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

import TrackList from '../components/TrackList';
import TrackListStates from '../components/TrackListStates';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import useGlobalTrackListStatus from '../hooks/useGlobalTrackListStatus';
import ConfigBridge from '../lib/bridge-config';
import DatabaseBridge from '../lib/bridge-database';
import type { QueueOrigin } from '../types/museeks';

type Search = {
  focused_album?: string;
};

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
  validateSearch: (search): Search => {
    const album =
      typeof search?.focused_album === 'string'
        ? search.focused_album
        : undefined;

    if (album) {
      return {
        focused_album: album,
      };
    }

    return {};
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

  // Scroll to the album if specified in the search params
  // Not super react-idiotmatic, but I'd rather have it here, to have all the
  // business logic in a single place
  const focusedAlbum = Route.useSearch().focused_album;

  useEffect(() => {
    if (focusedAlbum) {
      console.log(`[data-track-group="${focusedAlbum}"]`);
      const element = document.querySelector(
        `[data-track-group="${focusedAlbum}"]`,
      );

      console.log(element);
      element?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [focusedAlbum]);

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

import { createFileRoute } from '@tanstack/react-router';

import TracksList from '../components/TracksList';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import config from '../lib/config';
import database from '../lib/database';

import View from '../elements/View';

export const Route = createFileRoute('/artists/$artistID')({
  component: ViewArtistDetails,
  loader: async ({ params }) => {
    return {
      albums: await database.getArtistTracks(params.artistID),
      playlists: await database.getAllPlaylists(),
      tracksDensity: await config.get('track_view_density'),
    };
  },
});

export default function ViewArtistDetails() {
  const { albums, tracksDensity, playlists } = Route.useLoaderData();
  const content = useFilteredTrackGroup(albums, 'Artist', 'Asc');

  return (
    <View>
      {' '}
      <TracksList
        layout="grouped"
        data={content}
        tracksDensity={tracksDensity}
        playlists={playlists}
        isSortEnabled={false}
      />
    </View>
  );
}

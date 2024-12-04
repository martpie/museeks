import { createFileRoute } from '@tanstack/react-router';

import usePlayingTrackID from '../hooks/usePlayingTrackID';
import config from '../lib/config';
import database from '../lib/database';

import { useMemo } from 'react';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import { plural } from '../lib/localization';

import styles from './ViewArtistDetails.module.css';
import appStyles from './__root.module.css';

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
  const params = Route.useParams();
  const trackPlayingID = usePlayingTrackID();
  const content = useFilteredTrackGroup(albums, 'Artist', 'Asc');

  const tracksCount: number = useMemo(() => {
    return content.map((album) => album.tracks.length).reduce((a, b) => a + b);
  }, [content]);

  return (
    <div className={appStyles.view}>
      <h1 className={styles.artist}>{params.artistID}</h1>
      <div className={styles.artistMetadata}>
        {albums.length} {plural('album', albums.length)}, {tracksCount}{' '}
        {plural('track', tracksCount)}
      </div>

      {/*
      <TracksList
        content={content}
        type="library"
        tracksDensity={tracksDensity}
        trackPlayingID={trackPlayingID}
        playlists={playlists}
        headless
      /> */}
    </div>
  );
}

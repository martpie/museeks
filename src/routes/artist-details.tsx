import {
  type LoaderFunctionArgs,
  useLoaderData,
  useParams,
} from 'react-router-dom';
import TracksList from '../components/TracksList/TracksList';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import config from '../lib/config';
import database from '../lib/database';
import type { LoaderData } from '../types/museeks';

import { useMemo } from 'react';
import { useFilteredTrackGroup } from '../hooks/useFilteredTracks';
import { plural } from '../lib/localization';

import appStyles from './Root.module.css';
import styles from './ViewArtistDetails.module.css';

export default function ViewArtistDetails() {
  const { albums, tracksDensity, playlists } =
    useLoaderData() as ArtistDetailsLoaderData;
  const params = useParams();
  const trackPlayingID = usePlayingTrackID();
  const content = useFilteredTrackGroup(albums, 'Artist', 'Asc');

  const tracksCount: number = useMemo(() => {
    return content.map((album) => album.tracks.length).reduce((a, b) => a + b);
  }, [content]);

  return (
    <div className={appStyles.view}>
      <h1 className={styles.artist}>{params.artist}</h1>
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

export type ArtistDetailsLoaderData = LoaderData<
  typeof ViewArtistDetails.loader
>;

ViewArtistDetails.loader = async ({ params }: LoaderFunctionArgs) => {
  if (typeof params.artist !== 'string') {
    throw new Error('Invalid artist');
  }
  return {
    albums: await database.getArtistTracks(params.artist),
    playlists: await database.getAllPlaylists(),
    tracksDensity: (await config.get('track_view_density')) as
      | 'compact'
      | 'normal',
  };
};

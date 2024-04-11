import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useLoaderData } from 'react-router-dom';

import TracksList from '../components/TracksList/TracksList';
import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import useFilteredTracks from '../hooks/useFilteredTracks';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import config from '../lib/config';
import database from '../lib/database';
import useLibraryStore from '../stores/useLibraryStore';

import appStyles from './Root.module.css';
import styles from './ViewLibrary.module.css';
import type { LoaderData } from './router';

export default function ViewLibrary() {
  const trackPlayingID = usePlayingTrackID();
  const refreshing = useLibraryStore((state) => state.refreshing);
  const search = useLibraryStore((state) => state.search);

  const { playlists, tracksDensity } = useLoaderData() as LibraryLoaderData;

  // Some queries when switching routes can be expensive-ish (like getting all tracks),
  // while at the same time, the data will most of the time never change.
  // Using stale-while-revalidate libraries help us (fake-)loading this page faster
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: database.getAllTracks,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredTracks = useFilteredTracks(tracks ?? []);

  const getLibraryComponent = useMemo(() => {
    // Refreshing library
    if (isLoading) {
      return (
        <ViewMessage.Notice>
          <p>Loading library...</p>
        </ViewMessage.Notice>
      );
    }

    // Refreshing library
    if (refreshing) {
      return (
        <ViewMessage.Notice>
          <p>Your library is being scanned =)</p>
          <ViewMessage.Sub>hold on...</ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    // Empty library
    if (filteredTracks.length === 0 && search === '') {
      return (
        <ViewMessage.Notice>
          <p>There is no music in your library :(</p>
          <ViewMessage.Sub>
            <span>you can always just drop files and folders anywhere or</span>{' '}
            <Link to="/settings/library" draggable={false}>
              add your music here
            </Link>
          </ViewMessage.Sub>
        </ViewMessage.Notice>
      );
    }

    // Empty search
    if (filteredTracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Your search returned no results</p>
        </ViewMessage.Notice>
      );
    }

    // All good !
    return (
      <TracksList
        type="library"
        tracks={filteredTracks}
        tracksDensity={tracksDensity}
        trackPlayingID={trackPlayingID}
        playlists={playlists}
      />
    );
  }, [
    search,
    refreshing,
    filteredTracks,
    playlists,
    trackPlayingID,
    tracksDensity,
    isLoading,
  ]);

  return (
    <div className={`${appStyles.view} ${styles.viewLibrary}`}>
      {getLibraryComponent}
    </div>
  );
}

export type LibraryLoaderData = LoaderData<typeof ViewLibrary.loader>;

ViewLibrary.loader = async () => {
  return {
    playlists: await database.getAllPlaylists(),
    tracksDensity: (await config.get('track_view_density')) as
      | 'compact'
      | 'normal',
  };
};

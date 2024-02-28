import { useMemo } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';

import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import TracksList from '../components/TracksList/TracksList';
import useLibraryStore from '../stores/useLibraryStore';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import useFilteredTracks from '../hooks/useFilteredTracks';
import config from '../lib/config';

import { RootLoaderData } from './Root';
import { LoaderData } from './router';
import appStyles from './Root.module.css';
import styles from './ViewLibrary.module.css';

export default function ViewLibrary() {
  const trackPlayingID = usePlayingTrackID();
  const refreshing = useLibraryStore((state) => state.refreshing);
  const search = useLibraryStore((state) => state.search);

  const { playlists, tracksDensity } = useLoaderData() as LibraryLoaderData;
  const { tracks } = useRouteLoaderData('root') as RootLoaderData;
  const filteredTracks = useFilteredTracks(tracks);

  const getLibraryComponent = useMemo(() => {
    // Empty library
    if (filteredTracks.length === 0 && search === '') {
      if (refreshing) {
        return (
          <ViewMessage.Notice>
            <p>Your library is being scanned =)</p>
            <ViewMessage.Sub>hold on...</ViewMessage.Sub>
          </ViewMessage.Notice>
        );
      }

      return (
        <ViewMessage.Notice>
          <p>Too bad, there is no music in your library =(</p>
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
    playlists: await invoke('plugin:database|get_all_playlists'),
    tracksDensity: (await config.get('track_view_density')) as
      | 'compact'
      | 'normal',
  };
};

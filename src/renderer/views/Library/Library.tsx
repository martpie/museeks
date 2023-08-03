import { useMemo } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom';

import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import TracksList from '../../components/TracksList/TracksList';
import appStyles from '../Root.module.css';
import { LoaderResponse } from '../router';
import useFilteredTracks from '../../hooks/useFilteredTracks';
import useLibraryStore from '../../stores/useLibraryStore';
import usePlayingTrackID from '../../hooks/usePlayingTrackID';
import { PlaylistModel } from '../../../shared/types/museeks';
import { RootLoaderResponse } from '../Root';

import styles from './Library.module.css';

const { db } = window.MuseeksAPI;

export default function Library() {
  const trackPlayingId = usePlayingTrackID();
  const refreshing = useLibraryStore((state) => state.refreshing);
  const search = useLibraryStore((state) => state.search);

  const { playlists } = useLoaderData() as LibraryLoaderResponse;
  const { tracks } = useRouteLoaderData('root') as RootLoaderResponse;
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
        trackPlayingId={trackPlayingId}
        playlists={playlists}
      />
    );
  }, [search, refreshing, filteredTracks, playlists, trackPlayingId]);

  return (
    <div className={`${appStyles.view} ${styles.viewLibrary}`}>
      {getLibraryComponent}
    </div>
  );
}

export type LibraryLoaderResponse = {
  playlists: PlaylistModel[];
};

Library.loader = async (): Promise<LoaderResponse<LibraryLoaderResponse>> => {
  const playlists = await db.playlists.getAll();

  return {
    playlists,
  };
};

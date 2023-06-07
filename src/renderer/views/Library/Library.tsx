import { useMemo } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom';

import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import TracksList from '../../components/TracksList/TracksList';
import appStyles from '../Root.module.css';
import usePlayerStore from '../../stores/usePlayerStore';
import { LibraryLoaderResponse, RootLoaderResponse } from '../router';
import useFilteredTracks from '../../hooks/useFilteredTracks';
import useLibraryStore from '../../stores/useLibraryStore';

import styles from './Library.module.css';

export default function Library() {
  const trackPlayingId = usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });

  const { search, refreshing } = useLibraryStore((state) => ({
    search: state.search,
    refreshing: state.refreshing,
  }));

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
            <Link to='/settings/library' draggable={false}>
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
    return <TracksList type='library' tracks={filteredTracks} trackPlayingId={trackPlayingId} playlists={playlists} />;
  }, [search, refreshing, filteredTracks, playlists, trackPlayingId]);

  return <div className={`${appStyles.view} ${styles.viewLibrary}`}>{getLibraryComponent}</div>;
}

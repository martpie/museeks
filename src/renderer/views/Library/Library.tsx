import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import TracksList from '../../components/TracksList/TracksList';
import { filterTracks, sortTracks } from '../../lib/utils-library';
import SORT_ORDERS from '../../constants/sort-orders';
import { RootState } from '../../store/reducers';
import appStyles from '../Root.module.css';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './Library.module.css';

export default function Library() {
  const trackPlayingId = usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });

  const library = useSelector((state: RootState) => state.library);
  const playlists = useSelector((state: RootState) => state.playlists.list);
  const tracks = useSelector((state: RootState) => {
    const { search, tracks, sort } = state.library;

    // Filter and sort TracksList
    // sorting being a costly operation, do it after filtering
    const filteredTracks = sortTracks(filterTracks(tracks.library, search), SORT_ORDERS[sort.by][sort.order]);

    return filteredTracks;
  });

  const getLibraryComponent = useMemo(() => {
    // Loading library
    if (library.loading) {
      return (
        <ViewMessage.Notice>
          <p>Loading library...</p>
        </ViewMessage.Notice>
      );
    }

    // Empty library
    if (tracks.length === 0 && library.search === '') {
      if (library.refreshing) {
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
    if (tracks.length === 0) {
      return (
        <ViewMessage.Notice>
          <p>Your search returned no results</p>
        </ViewMessage.Notice>
      );
    }

    // All good !
    return <TracksList type='library' tracks={tracks} trackPlayingId={trackPlayingId} playlists={playlists} />;
  }, [library, playlists, tracks, trackPlayingId]);

  return <div className={`${appStyles.view} ${styles.viewLibrary}`}>{getLibraryComponent}</div>;
}

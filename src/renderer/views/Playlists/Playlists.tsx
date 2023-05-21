import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Navigate, Outlet } from 'react-router-dom';

import PlaylistsNav from '../../components/PlaylistsNav/PlaylistsNav';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import { RootState } from '../../store/reducers';
import appStyles from '../../views/Root.module.css';

import styles from './Playlists.module.css';

export default function Playlists() {
  const { playlistId } = useParams<{ playlistId?: string }>();
  const playlists = useSelector((state: RootState) => state.playlists.list);
  const playlistsLoading = useSelector((state: RootState) => state.playlists.loading);

  const createPlaylist = useCallback(async () => {
    await PlaylistsActions.create('New playlist', [], false, true);
  }, []);

  const autoRedirect = useCallback(() => {
    // If there is not playlist selected, redirect to the first one
    if (!playlistId) {
      return <Navigate to={`/playlists/${playlists[0]._id}`} />;
    }

    // Maybe this id does not exist in the library anymore
    // (after deleting a library for example)
    if (playlists.every((elem) => elem._id !== playlistId)) {
      if (playlists.length === 0) {
        return <Navigate to='/playlists' />;
      }

      return <Navigate to={`/playlists/${playlists[0]._id}`} />;
    }

    return null;
  }, [playlists, playlistId]);

  let playlistContent;

  if (playlistsLoading) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>Loading playlists...</p>
      </ViewMessage.Notice>
    );
  } else if (playlists.length === 0) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>You haven{"'"}t created any playlist yet</p>
        <ViewMessage.Sub>
          <button onClick={createPlaylist} className='reset' tabIndex={0}>
            create one now
          </button>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  } else {
    playlistContent = (
      <>
        {autoRedirect()}
        <Outlet />
      </>
    );
  }

  return (
    <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
      <PlaylistsNav playlists={playlists} />
      <div className={styles.playlist}>{playlistContent}</div>
    </div>
  );
}

import { useCallback } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';

import PlaylistsNav from '../../components/PlaylistsNav/PlaylistsNav';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';
import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import appStyles from '../../views/Root.module.css';
import { PlaylistsLoaderResponse } from '../router';

import styles from './Playlists.module.css';

export default function Playlists() {
  const { playlists } = useLoaderData() as PlaylistsLoaderResponse;

  const createPlaylist = useCallback(async () => {
    await PlaylistsActions.create('New playlist', [], false, true);
  }, []);

  let playlistContent;

  if (playlists.length === 0) {
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
    playlistContent = <Outlet />;
  }

  return (
    <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
      <PlaylistsNav playlists={playlists} />
      <div className={styles.playlist}>{playlistContent}</div>
    </div>
  );
}

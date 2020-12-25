import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect, useParams } from 'react-router-dom';

import PlaylistsNav from '../../components/PlaylistsNav/PlaylistsNav';
import * as ViewMessage from '../../elements/ViewMessage/ViewMessage';

import * as PlaylistsActions from '../../actions/PlaylistsActions';
import Playlist from '../../components/Playlists/Playlist';
import { RootState } from '../../reducers';

import * as appStyles from '../../App.module.css';
import * as styles from './Playlists.module.css';

const Playlists: React.FC = () => {
  const { playlistId } = useParams<{ playlistId?: string }>();
  const playlists = useSelector((state: RootState) => state.playlists.list);
  const playlistsLoading = useSelector((state: RootState) => state.playlists.loading);

  const createPlaylist = useCallback(async () => {
    await PlaylistsActions.create('New playlist', [], false, true);
  }, []);

  const autoRedirect = useCallback(() => {
    // If there is not playlist selected, redirect to the first one
    if (!playlistId) {
      return <Redirect to={`/playlists/${playlists[0]._id}`} />;
    }

    // Maybe this id does not exist in the library anymore
    // (after deleting a library for example)
    if (playlists.every((elem) => elem._id !== playlistId)) {
      if (playlists.length === 0) {
        return <Redirect to='/playlists' />;
      }

      return <Redirect to={`/playlists/${playlists[0]._id}`} />;
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
      <React.Fragment>
        <Route path='/playlists' render={autoRedirect} />
        <Route path='/playlists/:playlistId' component={Playlist} />
      </React.Fragment>
    );
  }

  return (
    <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
      <PlaylistsNav playlists={playlists} />
      <div className={styles.playlist}>{playlistContent}</div>
    </div>
  );
};

export default Playlists;

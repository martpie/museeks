import { useCallback, useEffect } from 'react';
import KeyBinding from 'react-keybinding-component';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import logger from '../../shared/lib/logger';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Toasts from '../components/Toasts/Toasts';
import AppActions from '../store/actions/AppActions';
import { isCtrlKey } from '../lib/utils-events';
import DropzoneImport from '../components/DropzoneImport/DropzoneImport';
import usePlayerStore from '../stores/usePlayerStore';
import MediaSessionEvents from '../components/Events/MediaSessionEvents';
import IPCPlayerEvents from '../components/Events/IPCPlayerEvents';
import PlayerEvents from '../components/Events/PlayerEvents';
import IPCNavigationEvents from '../components/Events/IPCNavigationEvents';
import useLibraryStore from '../stores/useLibraryStore';

import styles from './Root.module.css';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

export default function Museeks() {
  const navigate = useNavigate();
  const playerAPI = usePlayerStore((state) => state.api);

  // App shortcuts (not using Electron's global shortcuts API to avoid conflicts
  // with other applications)
  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.playPause();
          break;
        case ',':
          if (isCtrlKey(e)) {
            e.preventDefault();
            e.stopPropagation();
            navigate('/settings');
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.jumpTo(window.MuseeksAPI.player.getCurrentTime() - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          playerAPI.jumpTo(window.MuseeksAPI.player.getCurrentTime() + 10);
          break;
        default:
          break;
      }
    },
    [navigate, playerAPI]
  );

  useEffect(() => {
    AppActions.init();
  }, []);

  // Drop behavior to add tracks to the library from any string
  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: [NativeTypes.FILE],
      drop(item: { files: Array<File> }) {
        const files = item.files.map((file) => file.path);

        useLibraryStore
          .getState()
          .api.add(files)
          .then((/* _importedTracks */) => {
            // TODO: Import to playlist here
          })
          .catch((err) => {
            logger.warn(err);
          });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    };
  });

  return (
    <div className={`${styles.root} os__${window.MuseeksAPI.platform}`} ref={drop}>
      {/** Bunch of global event handlers */}
      <IPCNavigationEvents />
      <IPCPlayerEvents />
      <PlayerEvents />
      <MediaSessionEvents />
      <KeyBinding onKey={onKey} preventInputConflict />
      {/** The actual app */}
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <Toasts />
      <DropzoneImport title='Add music to the library' subtitle='Drop files or folders anywhere' shown={isOver} />
    </div>
  );
}

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import logger from '../../shared/lib/logger';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Toasts from '../components/Toasts/Toasts';
import AppActions from '../stores/AppAPI';
import DropzoneImport from '../components/DropzoneImport/DropzoneImport';
import MediaSessionEvents from '../components/Events/MediaSessionEvents';
import AppEvents from '../components/Events/AppEvents';
import PlayerEvents from '../components/Events/PlayerEvents';
import IPCPlayerEvents from '../components/Events/IPCPlayerEvents';
import IPCNavigationEvents from '../components/Events/IPCNavigationEvents';
import GlobalKeyBindings from '../components/Events/GlobalKeyBindings';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { TrackModel } from '../../shared/types/museeks';

import styles from './Root.module.css';
import { LoaderResponse } from './router';

const { db } = window.MuseeksAPI;

export default function RootView() {
  useEffect(() => {
    AppActions.init();
  }, []);

  const libraryAPI = useLibraryAPI();

  // Drop behavior to add tracks to the library from any string
  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: [NativeTypes.FILE],
      drop(item: { files: Array<File> }) {
        const files = item.files.map((file) => file.path);

        libraryAPI
          .add(files)
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
    <div
      className={`${styles.root} os__${window.MuseeksAPI.platform}`}
      ref={drop}
    >
      {/** Bunch of global event handlers */}
      <IPCNavigationEvents />
      <IPCPlayerEvents />
      <AppEvents />
      <PlayerEvents />
      <MediaSessionEvents />
      <GlobalKeyBindings />
      {/** The actual app */}
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <Toasts />
      <DropzoneImport
        title="Add music to the library"
        subtitle="Drop files or folders anywhere"
        shown={isOver}
      />
    </div>
  );
}

export type RootLoaderResponse = {
  tracks: TrackModel[];
};

RootView.loader = async (): Promise<LoaderResponse<RootLoaderResponse>> => {
  // this can be slow, think about caching it or something, especially when
  // we revalidate routing
  const tracks = await db.tracks.getAll();
  return { tracks };
};

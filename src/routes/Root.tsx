import { useEffect } from 'react';
import { Outlet } from 'react-router';

import AppEvents from '../components/AppEvents';
import DropzoneImport from '../components/DropzoneImport';
import Footer from '../components/Footer';
import GlobalKeyBindings from '../components/GlobalKeyBindings';
import Header from '../components/Header';
import IPCNavigationEvents from '../components/IPCNavigationEvents';
import IPCPlayerEvents from '../components/IPCPlayerEvents';
import LibraryEvents from '../components/LibraryEvents';
import MediaSessionEvents from '../components/MediaSessionEvents';
import PlayerEvents from '../components/PlayerEvents';
import Toasts from '../components/Toasts';
import useInvalidate from '../hooks/useInvalidate';
import SettingsAPI from '../stores/SettingsAPI';
import type { LoaderData } from '../types/syncudio';

import styles from './Root.module.css';

export default function ViewRoot() {
  const invalidate = useInvalidate();

  useEffect(() => {
    // If the app imported tracks, we need to refresh route data, but it seems invalidate is not super stable
    SettingsAPI.init(invalidate);
  }, [invalidate]);

  return (
    <div className={`${styles.root} os__${window.__SYNCUDIO_PLATFORM}`}>
      {/** Bunch of global event handlers */}
      <IPCNavigationEvents />
      <IPCPlayerEvents />
      <AppEvents />
      <LibraryEvents />
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
      <DropzoneImport />
    </div>
  );
}

export type RootLoaderData = LoaderData<typeof ViewRoot.loader>;

ViewRoot.loader = async () => null;

import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import DropzoneImport from '../components/DropzoneImport/DropzoneImport';
import AppEvents from '../components/Events/AppEvents';
import GlobalKeyBindings from '../components/Events/GlobalKeyBindings';
import IPCNavigationEvents from '../components/Events/IPCNavigationEvents';
import IPCPlayerEvents from '../components/Events/IPCPlayerEvents';
import LibraryEvents from '../components/Events/LibraryEvents';
import MediaSessionEvents from '../components/Events/MediaSessionEvents';
import PlayerEvents from '../components/Events/PlayerEvents';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import Toasts from '../components/Toasts/Toasts';
import SettingsAPI from '../stores/SettingsAPI';

import useInvalidate from '../hooks/useInvalidate';
import styles from './Root.module.css';
import type { LoaderData } from './router';

export default function ViewRoot() {
  const invalidate = useInvalidate();

  useEffect(() => {
    SettingsAPI.init(invalidate)
      // If the app imported tracks, we need to refresh route data
      .then(); // infinite loop!
  }, [invalidate]);

  return (
    <div className={`${styles.root} os__${window.__MUSEEKS_PLATFORM}`}>
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
      <Suspense fallback={null}>
        <DropzoneImport />
      </Suspense>
    </div>
  );
}

export type RootLoaderData = LoaderData<typeof ViewRoot.loader>;

ViewRoot.loader = async () => null;

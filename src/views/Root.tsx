import { getCurrent } from '@tauri-apps/api/window';
import { Suspense, useEffect } from 'react';
// import { useEffect } from "react";
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

import styles from './Root.module.css';
import type { LoaderData } from './router';

export default function ViewRoot() {
  useEffect(() => {
    SettingsAPI.check()
      // Show the app once everything is loaded
      .then(() => getCurrent())
      .then((window) => {
        window.show();
      });
  }, []);

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

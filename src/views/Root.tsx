// import { useEffect } from "react";
import { Outlet, useLoaderData } from 'react-router-dom';
import { type } from '@tauri-apps/plugin-os';
// import logger from "../lib/logger";
import { invoke } from '@tauri-apps/api/core';
import { getCurrent } from '@tauri-apps/api/window';
import { Suspense, useEffect } from 'react';

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Toasts from '../components/Toasts/Toasts';
// import AppActions from "../stores/AppAPI";
import DropzoneImport from '../components/DropzoneImport/DropzoneImport';
import MediaSessionEvents from '../components/Events/MediaSessionEvents';
// import AppEvents from "../components/Events/AppEvents";
import PlayerEvents from '../components/Events/PlayerEvents';
// import IPCPlayerEvents from "../components/Events/IPCPlayerEvents";
// import IPCNavigationEvents from "../components/Events/IPCNavigationEvents";
import GlobalKeyBindings from '../components/Events/GlobalKeyBindings';
// import { useLibraryAPI } from "../stores/useLibraryStore";
import SettingsAPI from '../stores/SettingsAPI';
import { TrackDoc } from '../generated/typings';

import styles from './Root.module.css';
import { LoaderData } from './router';

export default function ViewRoot() {
  useEffect(() => {
    SettingsAPI.check()
      // Show the app once everything is loaded
      .then(() => getCurrent())
      .then((window) => {
        window.show();
      });
  }, []);

  const { platform } = useLoaderData() as RootLoaderData;

  return (
    <div className={`${styles.root} os__${platform}`}>
      {/** Bunch of global event handlers */}
      {/** TODO: */}
      {/* <IPCNavigationEvents />
      <IPCPlayerEvents />
      <AppEvents />*/}
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

ViewRoot.loader = async () => {
  const osType = await type();

  // this can be slow, think about caching it or something, especially when
  // we revalidate routing
  const tracks = (await invoke(
    'plugin:database|get_all_tracks',
  )) as Array<TrackDoc>;
  return { tracks, platform: osType };
};

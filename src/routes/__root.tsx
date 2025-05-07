import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useEffect } from 'react';

import AppEvents from '../components/AppEvents';
import DropzoneImport from '../components/DropzoneImport';
import Footer from '../components/Footer';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';
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

import database from '../lib/database';
import usePlayerStore from '../stores/usePlayerStore';
import styles from './__root.module.css';

type Search = {
  jump_to_playing_track?: boolean;
};

export const Route = createRootRoute({
  component: ViewRoot,
  errorComponent: GlobalErrorBoundary,
  validateSearch: (search): Search => {
    return {
      jump_to_playing_track: Boolean(search?.jump_to_playing_track ?? false),
    };
  },
  loader: async () => {
    const playlists = await database.getAllPlaylists();
    const firstPlaylistID: string | null = playlists[0].id ?? null;

    return {
      firstPlaylistID,
    };
  },
});

function ViewRoot() {
  const invalidate = useInvalidate();
  const { firstPlaylistID } = Route.useLoaderData();
  const queueOrigin = usePlayerStore((state) => state.queueOrigin);
  const playlistID =
    queueOrigin?.type === 'playlist' ? queueOrigin.playlistID : firstPlaylistID;

  useEffect(() => {
    // If the app imported tracks, we need to refresh route data, but it seems invalidate is not super stable
    SettingsAPI.init(invalidate);
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
      <Footer playlistID={playlistID} />

      {/** Out-of-the-flow UI bits */}
      <Toasts />
      <DropzoneImport />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}

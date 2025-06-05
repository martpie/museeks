import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import cx from 'classnames';
import { useEffect, useState } from 'react';

import AppEvents from '../components/AppEvents';
import DropzoneImport from '../components/DropzoneImport';
import Footer from '../components/Footer';
import { ErrorView, NotFoundView } from '../components/GlobalErrors';
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

import { info } from '@tauri-apps/plugin-log';
import styles from './__root.module.css';

type Search = {
  jump_to_playing_track?: boolean;
};

export const Route = createRootRoute({
  component: ViewRoot,
  errorComponent: ErrorView,
  notFoundComponent: NotFoundView,
  validateSearch: (search): Search => {
    // Why circumvolutions here? If the key is defined, it will be added to the
    // fragment of the URL (after the #), which will prevent the default_view
    // plugin to navigate to the default view.
    const jump_to_playing_track = Boolean(search?.jump_to_playing_track);

    if (jump_to_playing_track === true) {
      return {
        jump_to_playing_track,
      };
    }

    return {};
  },
});

function ViewRoot() {
  const invalidate = useInvalidate();

  useEffect(() => {
    // If the app imported tracks, we need to refresh route data, but it seems invalidate is not super stable
    SettingsAPI.init(invalidate);
  }, [invalidate]);

  // Log each navigation to the console for debug purposes
  const location = useLocation();

  useEffect(() => {
    info(`Navigated to: ${location.pathname}`);
  }, [location]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={cx(styles.root, `os__${window.__MUSEEKS_PLATFORM}`, {
        [styles.loaded]: loaded,
      })}
    >
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

      {/** Out-of-the-flow UI bits */}
      <Toasts />
      <DropzoneImport />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}

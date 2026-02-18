import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { info } from '@tauri-apps/plugin-log';
import cx from 'classnames';
import { useEffect, useRef } from 'react';

import AppEvents from '../components/AppEvents';
import DropzoneImport from '../components/DropzoneImport';
import Footer from '../components/Footer';
import { ErrorView, NotFoundView } from '../components/GlobalErrors';
import GlobalKeyBindings from '../components/GlobalKeyBindings';
import Header from '../components/Header';
import IPCNavigationEvents from '../components/IPCNavigationEvents';
import IPCPlayerEvents from '../components/IPCPlayerEvents';
import LibraryEvents from '../components/LibraryEvents';
import PlayerEvents from '../components/PlayerEvents';
import Toasts from '../components/Toasts';
import useInvalidate from '../hooks/useInvalidate';
import SettingsAPI from '../stores/SettingsAPI';
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

  // Manual prevention of a useEffect being called twice (to avoid refreshing the
  // library twice on startup in dev mode).
  // Also, with useInvalidate, SettingsAPI.init would infinitely loop. This means
  // something is fishy and needs to be fixed "somewhere".
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    // If the app imported tracks, we need to refresh route data, but it seems invalidate is not super stable
    SettingsAPI.init(invalidate);
  }, [invalidate]);

  // Log each navigation to the console for debug purposes
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    info(`Navigated to: ${pathname}`);
  }, [pathname]);

  return (
    <div
      className={cx(styles.root)}
      data-museeks-os={window.__MUSEEKS_PLATFORM}
    >
      {/** Bunch of global event handlers */}
      <IPCNavigationEvents />
      <IPCPlayerEvents />
      <AppEvents />
      <LibraryEvents />
      <PlayerEvents />
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
    </div>
  );
}

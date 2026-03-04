import * as stylex from '@stylexjs/stylex';
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { info } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

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
import { logAndNotifyError } from '../lib/utils';
import SettingsAPI from '../stores/SettingsAPI';

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
    SettingsAPI.init(invalidate).catch(logAndNotifyError);
  }, [invalidate]);

  // Log each navigation to the console for debug purposes
  const location = useLocation();

  useEffect(() => {
    info(`Navigated to: ${location.pathname}`);
  }, [location]);

  return (
    <div
      {...stylex.props(styles.root)}
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
      <main {...stylex.props(styles.mainContent)}>
        <Outlet />
      </main>
      <Footer />

      {/** Out-of-the-flow UI bits */}
      <Toasts />
      <DropzoneImport />
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  mainContent: {
    width: '100%',
    flex: '1 1 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
});

import {
  createHashRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';

import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import ExternalLink from '../elements/ExternalLink/ExternalLink';
import logger from '../../shared/lib/logger';

import RootView from './Root';
import LibraryView from './Library/Library';
import PlaylistsView from './Playlists/Playlists';
import PlaylistView from './Playlists/Playlist';
import SettingsView from './Settings/Settings';
import SettingsLibrary from './Settings/SettingsLibrary';
import SettingsUI from './Settings/SettingsUI';
import SettingsAudio from './Settings/SettingsAudio';
import SettingsAbout from './Settings/SettingsAbout';
import DetailsView from './Details/Details';

const router = createHashRouter([
  {
    path: '/',
    id: 'root',
    element: <RootView />,
    loader: RootView.loader,
    ErrorBoundary: GlobalErrorBoundary,
    children: [
      {
        path: 'library',
        id: 'library',
        element: <LibraryView />,
        loader: LibraryView.loader,
      },
      {
        path: 'playlists',
        id: 'playlists',
        element: <PlaylistsView />,
        loader: PlaylistsView.loader,
        children: [
          {
            path: ':playlistId',
            id: 'playlist-details',
            element: <PlaylistView />,
            loader: PlaylistView.loader,
          },
        ],
      },
      {
        path: 'settings',
        id: 'settings',
        element: <SettingsView />,
        loader: SettingsView.loader,
        children: [
          { path: 'library', element: <SettingsLibrary /> },
          { path: 'interface', element: <SettingsUI /> },
          { path: 'audio', element: <SettingsAudio /> },
          { path: 'about', element: <SettingsAbout /> },
        ],
      },
      {
        path: 'details/:trackId',
        element: <DetailsView />,
        loader: DetailsView.loader,
      },
    ],
  },
]);

export default router;

/**
 * Components helpers
 */

function GlobalErrorBoundary() {
  const error = useRouteError();
  logger.error(error);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.error?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <ViewMessage.Notice>
      <p>
        <span role="img" aria-label="boom">
          💥
        </span>{' '}
        Something wrong happened: {errorMessage}
      </p>
      <ViewMessage.Sub>
        If it happens again, please{' '}
        <ExternalLink href="https://github.com/martpie/museeks/issues">
          report an issue
        </ExternalLink>
      </ViewMessage.Sub>
    </ViewMessage.Notice>
  );
}

/**
 * Loader Types, to manually type useLoaderData()
 */
export type LoaderResponse<T> = Response | T;

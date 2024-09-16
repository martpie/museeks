import * as logger from '@tauri-apps/plugin-log';
import {
  type LoaderFunctionArgs,
  createHashRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';

import ExternalLink from '../elements/ExternalLink/ExternalLink';
import * as ViewMessage from '../elements/ViewMessage/ViewMessage';

import RootView from './Root';
import ViewLibrary from './ViewLibrary';
import ViewPlaylistDetails from './ViewPlaylistDetails';
import ViewPlaylists from './ViewPlaylists';
import ViewSettings from './ViewSettings';
import ViewSettingsAbout from './ViewSettingsAbout';
import ViewSettingsAudio from './ViewSettingsAudio';
import ViewSettingsLibrary from './ViewSettingsLibrary';
import ViewSettingsUI from './ViewSettingsUI';
import ViewTrackDetails from './ViewTrackDetails';

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
        element: <ViewLibrary />,
        loader: ViewLibrary.loader,
      },
      {
        path: 'playlists',
        id: 'playlists',
        element: <ViewPlaylists />,
        loader: ViewPlaylists.loader,
        children: [
          {
            path: ':playlistID',
            id: 'playlist-details',
            element: <ViewPlaylistDetails />,
            loader: ViewPlaylistDetails.loader,
          },
        ],
      },
      {
        path: 'settings',
        id: 'settings',
        element: <ViewSettings />,
        children: [
          {
            path: 'library',
            element: <ViewSettingsLibrary />,
            loader: ViewSettings.loader,
          },
          {
            path: 'interface',
            element: <ViewSettingsUI />,
            loader: ViewSettings.loader,
          },
          {
            path: 'audio',
            element: <ViewSettingsAudio />,
            loader: ViewSettings.loader,
          },
          {
            path: 'about',
            element: <ViewSettingsAbout />,
            loader: ViewSettings.loader,
          },
        ],
      },
      {
        path: 'details/:trackID',
        element: <ViewTrackDetails />,
        loader: ViewTrackDetails.loader,
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
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  logger.error(errorMessage);

  return (
    <ViewMessage.Notice>
      <p>
        {/* biome-ignore lint/a11y/useSemanticElements: no <img> for emojis */}
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
export type LoaderData<T> = T extends (
  args: LoaderFunctionArgs,
) => Promise<infer U>
  ? Exclude<U, Response>
  : never;

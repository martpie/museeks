import { type LoaderFunctionArgs, createHashRouter } from 'react-router-dom';

import GlobalErrorBoundary from '../components/GlobalErrorBoundary/GlobalErrorBoundary';
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
 * Loader Types, to manually type useLoaderData()
 */
export type LoaderData<T> = T extends (
  args: LoaderFunctionArgs,
) => Promise<infer U>
  ? Exclude<U, Response>
  : never;

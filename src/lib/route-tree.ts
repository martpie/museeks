import type { RouteObject } from 'react-router';

import GlobalErrorBoundary from '../components/GlobalErrorBoundary';
import RootView from '../routes/Root';
import ViewLibrary from '../routes/ViewLibrary';
import ViewPlaylistDetails from '../routes/ViewPlaylistDetails';
import ViewPlaylists from '../routes/ViewPlaylists';
import ViewSettings from '../routes/ViewSettings';
import ViewSettingsAbout from '../routes/ViewSettingsAbout';
import ViewSettingsAudio from '../routes/ViewSettingsAudio';
import ViewSettingsLibrary from '../routes/ViewSettingsLibrary';
import ViewSettingsUI from '../routes/ViewSettingsUI';
import ViewTrackDetails from '../routes/ViewTrackDetails';

const routeTree: RouteObject[] = [
  {
    path: '/',
    id: 'root',
    Component: RootView,
    loader: RootView.loader,
    HydrateFallback: () => null, // there should be no hydration as we're SPA-only
    ErrorBoundary: GlobalErrorBoundary,
    children: [
      {
        path: 'library',
        id: 'library',
        Component: ViewLibrary,
        loader: ViewLibrary.loader,
      },
      {
        path: 'playlists',
        id: 'playlists',
        Component: ViewPlaylists,
        loader: ViewPlaylists.loader,
        children: [
          {
            path: ':playlistID',
            id: 'playlist-details',
            Component: ViewPlaylistDetails,
            loader: ViewPlaylistDetails.loader,
          },
        ],
      },
      {
        path: 'settings',
        id: 'settings',
        Component: ViewSettings,
        children: [
          {
            path: 'library',
            Component: ViewSettingsLibrary,
            loader: ViewSettings.loader,
          },
          {
            path: 'interface',
            Component: ViewSettingsUI,
            loader: ViewSettings.loader,
          },
          {
            path: 'audio',
            Component: ViewSettingsAudio,
            loader: ViewSettings.loader,
          },
          {
            path: 'about',
            Component: ViewSettingsAbout,
            loader: ViewSettings.loader,
          },
        ],
      },
      {
        path: 'details/:trackID',
        Component: ViewTrackDetails,
        loader: ViewTrackDetails.loader,
      },
    ],
  },
];

export default routeTree;

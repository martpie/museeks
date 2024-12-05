import type { RouteObject } from 'react-router-dom';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';
import RootView from '../views/Root';
import ViewLibrary from '../views/ViewLibrary';
import ViewPlaylistDetails from '../views/ViewPlaylistDetails';
import ViewPlaylists from '../views/ViewPlaylists';
import ViewSettings from '../views/ViewSettings';
import ViewSettingsAbout from '../views/ViewSettingsAbout';
import ViewSettingsAudio from '../views/ViewSettingsAudio';
import ViewSettingsLibrary from '../views/ViewSettingsLibrary';
import ViewSettingsUI from '../views/ViewSettingsUI';
import ViewTrackDetails from '../views/ViewTrackDetails';

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

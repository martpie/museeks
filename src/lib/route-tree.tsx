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

const routeTree = [
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
];

export default routeTree;

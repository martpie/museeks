import { createHashRouter } from 'react-router-dom';

// import App from './App';
import Playlist from '../components/Playlists/Playlist';

import Root from './Root';
import LibraryView from './Library/Library';
import PlaylistsView from './Playlists/Playlists';
import SettingsView from './Settings/Settings';
import SettingsLibrary from './Settings/SettingsLibrary';
import SettingsUI from './Settings/SettingsUI';
import SettingsAudio from './Settings/SettingsAudio';
import SettingsAbout from './Settings/SettingsAbout';
import DetailsView from './Details/Details';

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    // TODO: error state for router
    children: [
      {
        path: 'library',
        element: <LibraryView />,
      },
      { path: 'playlists', element: <PlaylistsView />, children: [{ path: ':playlistId', element: <Playlist /> }] },
      {
        path: 'settings',
        element: <SettingsView />,
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
      },
    ],
  },
]);

export default router;

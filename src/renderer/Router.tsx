import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

import { Config } from '../shared/types/museeks';

import history from './lib/history';

// Views
import App from './App';
import LibraryView from './views/Library/Library';
import PlaylistsView from './views/Playlists/Playlists';
import SettingsView from './views/Settings/Settings';
import SettingsLibrary from './views/Settings/SettingsLibrary';
import SettingsUI from './views/Settings/SettingsUI';
import SettingsAudio from './views/Settings/SettingsAudio';
import SettingsAbout from './views/Settings/SettingsAbout';
import { config } from './lib/app';
import { RootState } from './store/reducers';
import Playlist from './components/Playlists/Playlist';

const Router: React.FC = () => {
  const library = useSelector((state: RootState) => state.library);
  const conf = config.get() as Config;

  return (
    <HistoryRouter history={history}>
      <App>
        <Routes>
          <Route path='/library' element={<LibraryView />} />
          <Route path='/settings' element={<SettingsView />}>
            <Route path='library' element={<SettingsLibrary library={library} />} />
            <Route path='interface' element={<SettingsUI config={conf} />} />
            <Route path='audio' element={<SettingsAudio config={conf} />} />
            <Route path='about' element={<SettingsAbout />} />
          </Route>
          <Route path='/playlists' element={<PlaylistsView />}>
            <Route path=':playlistId' element={<Playlist />} />
          </Route>
        </Routes>
      </App>
    </HistoryRouter>
  );
};

export default Router;

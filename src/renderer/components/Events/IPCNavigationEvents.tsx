import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePlayerAPI } from '../../stores/usePlayerStore';
import channels from '../../../shared/lib/ipc-channels';

const { ipcRenderer } = window.ElectronAPI;

/**
 * Handle app-level IPC Navigation events
 */
function IPCNavigationEvents() {
  const navigate = useNavigate();
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    function goToLibrary() {
      navigate('/library');
    }

    function goToPlaylists() {
      navigate('/library');
    }

    function goToPlayingTrack() {
      playerAPI.jumpToPlayingTrack();
    }

    // Shortcuts from the application menu
    ipcRenderer.on(channels.MENU_GO_TO_LIBRARY, goToLibrary);
    ipcRenderer.on(channels.MENU_GO_TO_PLAYLISTS, goToPlaylists);
    ipcRenderer.on(channels.MENU_JUMP_TO_PLAYING_TRACK, goToPlayingTrack);

    return function cleanup() {
      ipcRenderer.on(channels.MENU_GO_TO_LIBRARY, goToLibrary);
      ipcRenderer.on(channels.MENU_GO_TO_PLAYLISTS, goToPlaylists);
      ipcRenderer.on(channels.MENU_JUMP_TO_PLAYING_TRACK, goToPlayingTrack);
    };
  }, [navigate, playerAPI]);

  return null;
}

export default IPCNavigationEvents;

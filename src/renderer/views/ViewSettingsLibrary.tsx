import { useCallback } from 'react';

import * as Setting from '../components/Setting/Setting';
import Button from '../elements/Button/Button';
import channels from '../../shared/lib/ipc-channels';
import logger from '../../shared/lib/logger';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

const { ipcRenderer } = window.ElectronAPI;

export default function ViewSettingsLibrary() {
  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);

  const openFolderSelector = useCallback(async () => {
    const options: Electron.OpenDialogOptions = {
      properties: ['multiSelections', 'openDirectory', 'openFile'],
    };

    const result = await ipcRenderer.invoke(channels.DIALOG_OPEN, options);

    if (result.filePaths) {
      libraryAPI.add(result.filePaths).catch((err) => {
        logger.warn(err);
      });
    }
  }, [libraryAPI]);

  return (
    <div className="setting settings-musicfolder">
      <Setting.Section>
        <h3 style={{ marginTop: 0 }}>Import music</h3>
        <Setting.Description>
          This will also scan for <code>.m3u</code> files and create
          corresponding playlists.
        </Setting.Description>
        <Button disabled={isLibraryRefreshing} onClick={openFolderSelector}>
          Add files or folders
        </Button>
      </Setting.Section>
      <Setting.Section>
        <h3>Danger zone</h3>
        <Button
          relevancy="danger"
          title="Fully reset the library"
          disabled={isLibraryRefreshing}
          onClick={libraryAPI.reset}
        >
          Reset library
        </Button>
      </Setting.Section>
    </div>
  );
}

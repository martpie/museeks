import React, { useCallback } from 'react';
import { ipcRenderer } from 'electron';

import * as Setting from '../../components/Setting/Setting';

import * as LibraryActions from '../../store/actions/LibraryActions';
import * as PlayerActions from '../../store/actions/PlayerActions';
import { LibraryState } from '../../store/reducers/library';
import Button from '../../elements/Button/Button';
import channels from '../../../shared/lib/ipc-channels';

interface Props {
  library: LibraryState;
}

const SettingsLibrary: React.FC<Props> = (props) => {
  const resetLibrary = useCallback(async () => {
    PlayerActions.stop();
    await LibraryActions.reset();
  }, []);

  const openFolderSelector = useCallback(async () => {
    const options: Electron.OpenDialogOptions = {
      properties: ['multiSelections', 'openDirectory', 'openFile'],
    };

    const result = await ipcRenderer.invoke(channels.DIALOG_OPEN, options);

    if (result.filePaths) {
      LibraryActions.add(result.filePaths).catch((err) => {
        console.warn(err);
      });
    }
  }, []);

  return (
    <div className='setting settings-musicfolder'>
      <Setting.Section>
        <h3 style={{ marginTop: 0 }}>Import music</h3>
        <Setting.Description>
          This will also scan for <code>.m3u</code> files and create corresponding playlists.
        </Setting.Description>
        <Button disabled={props.library.refreshing} onClick={openFolderSelector}>
          Add files or folders
        </Button>
      </Setting.Section>
      <Setting.Section>
        <h3>Danger zone</h3>
        <Button
          relevancy='danger'
          title='Fully reset the library'
          disabled={props.library.refreshing}
          onClick={resetLibrary}
        >
          Reset library
        </Button>
      </Setting.Section>
    </div>
  );
};

export default SettingsLibrary;

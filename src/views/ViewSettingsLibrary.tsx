import { useLoaderData } from 'react-router-dom';
import * as Setting from '../components/Setting/Setting';
import Button from '../elements/Button/Button';
import Flexbox from '../elements/Flexbox/Flexbox';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';
import type { SettingsLoaderData } from './ViewSettings';

import CheckboxSetting from '../components/SettingCheckbox/SettingCheckbox';
import SettingsAPI from '../stores/SettingsAPI';
import styles from './ViewSettingsLibrary.module.css';

export default function ViewSettingsLibrary() {
  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);
  const { config } = useLoaderData() as SettingsLoaderData;

  return (
    <div className="setting settings-musicfolder">
      <Setting.Section>
        <Setting.Title>Files</Setting.Title>
        {config.library_folders.length === 0 && (
          <Setting.Description>
            There are no folders in your library.
          </Setting.Description>
        )}
        {config.library_folders.length > 0 && (
          <ul className={styles.libraryFolders}>
            {config.library_folders.map((folder) => {
              return (
                <li key={folder}>
                  <Flexbox align="center">
                    <button
                      type="button"
                      className={styles.libraryFoldersRemove}
                      data-museeks-action
                      onClick={() => libraryAPI.removeLibraryFolder(folder)}
                    >
                      &times;
                    </button>
                    <span>{folder}</span>
                  </Flexbox>
                </li>
              );
            })}
          </ul>
        )}
        <Flexbox gap={4}>
          <Button
            disabled={isLibraryRefreshing}
            onClick={libraryAPI.addLibraryFolder}
          >
            Add folder
          </Button>
          <Button disabled={isLibraryRefreshing} onClick={libraryAPI.refresh}>
            Refresh library
          </Button>
        </Flexbox>
        <Setting.Description>
          <code>.m3u</code> files will also be imported as playlists.
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          slug="library-autorefresh"
          title="Automatically refresh library on startup"
          value={config.library_autorefresh}
          onChange={SettingsAPI.toggleLibraryAutorefresh}
        />
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>Danger zone</Setting.Title>
        <Setting.Description>
          Delete all tracks and playlists from Museeks.
        </Setting.Description>
        <Flexbox>
          <Button
            relevancy="danger"
            title="Fully reset the library"
            disabled={isLibraryRefreshing}
            onClick={libraryAPI.reset}
          >
            Reset library
          </Button>
        </Flexbox>
      </Setting.Section>
    </div>
  );
}

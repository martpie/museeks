import { useLoaderData } from 'react-router';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import Button from '../elements/Button';
import Flexbox from '../elements/Flexbox';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import SettingsAPI from '../stores/SettingsAPI';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';
import type { SettingsLoaderData } from './settings';

import { open } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';
import styles from './settings-library.module.css';

export default function ViewSettingsLibrary() {
  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);
  const { config } = useLoaderData() as SettingsLoaderData;
  const invalidate = useInvalidate();

  const addLibraryFolders = useCallback(async () => {
    const paths = await open({
      directory: true,
      multiple: true,
    });

    if (paths == null) {
      return;
    }

    await libraryAPI.addLibraryFolders(paths);
    invalidate();
  }, [libraryAPI.addLibraryFolders, invalidate]);

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
                      data-syncudio-action
                      onClick={() =>
                        libraryAPI.removeLibraryFolder(folder).then(invalidate)
                      }
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
            onClick={useInvalidateCallback(addLibraryFolders)}
          >
            Add folder
          </Button>
          <Button
            disabled={isLibraryRefreshing}
            onClick={useInvalidateCallback(libraryAPI.refresh)}
          >
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
          onChange={useInvalidateCallback(SettingsAPI.toggleLibraryAutorefresh)}
        />
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>Danger zone</Setting.Title>
        <Setting.Description>
          Delete all tracks and playlists from Syncudio.
        </Setting.Description>
        <Flexbox>
          <Button
            relevancy="danger"
            title="Fully reset the library"
            disabled={isLibraryRefreshing}
            onClick={useInvalidateCallback(libraryAPI.reset)}
          >
            Reset library
          </Button>
        </Flexbox>
      </Setting.Section>
    </div>
  );
}

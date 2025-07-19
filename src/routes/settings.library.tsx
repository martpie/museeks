import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { ask, open } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import Button from '../elements/Button';
import Flexbox from '../elements/Flexbox';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import SettingsAPI from '../stores/SettingsAPI';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';
import styles from './settings-library.module.css';

export const Route = createFileRoute('/settings/library')({
  component: ViewSettingsLibrary,
});

function ViewSettingsLibrary() {
  const { config } = useLoaderData({ from: '/settings' });

  const libraryAPI = useLibraryAPI();
  const isLibraryRefreshing = useLibraryStore((state) => state.refreshing);
  const invalidate = useInvalidate();
  const { t } = useLingui();

  const addLibraryFolders = useCallback(async () => {
    const paths = await open({
      directory: true,
      multiple: true,
    });

    if (paths == null) {
      return;
    }

    await libraryAPI.addLibraryFolders(paths);
    await invalidate();
  }, [libraryAPI.addLibraryFolders, invalidate]);

  return (
    <>
      <Setting.Section>
        <Setting.Title>
          <Trans>Files</Trans>
        </Setting.Title>
        {config.library_folders.length === 0 && (
          <Setting.Description>
            <Trans>There are no folders in your library.</Trans>
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
                      title={t`Remove`}
                      data-museeks-action
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
            <Trans>Add folder</Trans>
          </Button>
          <Button
            disabled={isLibraryRefreshing}
            onClick={useInvalidateCallback(() => libraryAPI.scan())}
          >
            <Trans>Scan</Trans>
          </Button>
          <Button
            disabled={isLibraryRefreshing}
            onClick={useInvalidateCallback(async () => {
              const confirm = await ask(
                t`All track data will be updated from the base files, but your original files won't be modified. Any Museeks-specific edits you may have done will be reset.`,
                {
                  title: t`Refresh all tracks?`,
                  kind: 'warning',
                  cancelLabel: t`Cancel`,
                  okLabel: t`Refresh`,
                },
              );

              if (confirm) {
                libraryAPI.scan(true);
              }
            })}
            title={t`Force the refresh of all tracks tags`}
          >
            <Trans>Refresh</Trans>
          </Button>
        </Flexbox>
        <Setting.Description>
          <Trans>
            <code>.m3u</code> files will also be imported as playlists.
          </Trans>
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          title={t`Automatically refresh library on startup`}
          value={config.library_autorefresh}
          onChange={useInvalidateCallback(SettingsAPI.toggleLibraryAutorefresh)}
        />
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>
          <Trans>Danger zone</Trans>
        </Setting.Title>
        <Setting.Description>
          <Trans>Delete all tracks and playlists from Museeks.</Trans>
        </Setting.Description>
        <Flexbox>
          <Button
            relevancy="danger"
            title={t`Fully reset the library`}
            disabled={isLibraryRefreshing}
            onClick={useInvalidateCallback(async () => {
              const confirm = await ask(
                t`All your tracks and playlists will be deleted from Museeks.`,
                {
                  title: t`Reset library?`,
                  kind: 'warning',
                  cancelLabel: t`Cancel`,
                  okLabel: t`Reset`,
                },
              );

              if (confirm) {
                libraryAPI.reset();
              }
            })}
          >
            <Trans>Reset library</Trans>
          </Button>
        </Flexbox>
      </Setting.Section>
    </>
  );
}

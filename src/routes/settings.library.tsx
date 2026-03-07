import { Trans, useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
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

export const Route = createFileRoute('/settings/library')({
  component: ViewSettingsLibrary,
});

function ViewSettingsLibrary() {
  const { config } = useLoaderData({ from: '/settings' });
  const libraryFolders = config.library_folders;

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
  }, [libraryAPI, invalidate]);

  return (
    <>
      <Setting.Section>
        <Setting.Title>
          <Trans>Files</Trans>
        </Setting.Title>
        {libraryFolders.length === 0 && (
          <Setting.Description>
            <Trans>There are no folders in your library.</Trans>
          </Setting.Description>
        )}
        {libraryFolders.length > 0 && (
          <ul sx={styles.libraryFolders}>
            {config.library_folders.map((folder) => {
              return (
                <li key={folder}>
                  <Flexbox align="center">
                    <button
                      type="button"
                      sx={styles.libraryFoldersRemove}
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
            disabled={isLibraryRefreshing || libraryFolders.length === 0}
            onClick={useInvalidateCallback(() => libraryAPI.scan())}
            data-testid="scan-library-button"
          >
            <Trans>Scan</Trans>
          </Button>
          <Button
            disabled={isLibraryRefreshing || libraryFolders.length === 0}
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
                await libraryAPI.scan(true);
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
                await libraryAPI.reset();
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

const styles = stylex.create({
  libraryFolders: {
    listStyle: 'none',
    paddingBlock: '4px',
    paddingInline: '8px',
    margin: '0',
    fontFamily: 'monospace',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--border-color)',
    overflowX: 'auto',
    whiteSpace: 'pre',
    width: '120%',
  },
  libraryFoldersRemove: {
    color: 'red',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    appearance: 'none',
    fontSize: '16px',
  },
});

import { Menu, MenuItem, PredefinedMenuItem } from '@tauri-apps/api/menu';
import type React from 'react';
import { useCallback, useState } from 'react';
import Icon from 'react-fontawesome';

import type { Playlist } from '../../generated/typings';
import database from '../../lib/database';
import { logAndNotifyError } from '../../lib/utils';
import PlaylistsAPI from '../../stores/PlaylistsAPI';
import PlaylistsNavLink from '../PlaylistsNavLink/PlaylistsNavLink';

import styles from './PlaylistsNav.module.css';

type Props = {
  playlists: Playlist[];
};

export default function PlaylistsNav(props: Props) {
  const [renamed, setRenamed] = useState<string | null>(null);

  const showContextMenu = useCallback(
    async (e: React.MouseEvent, playlistID: string) => {
      e.preventDefault();

      const menuItems = await Promise.all([
        MenuItem.new({
          text: 'Rename',
          action: () => {
            setRenamed(playlistID);
          },
        }),
        MenuItem.new({
          text: 'Delete',
          action: async () => {
            await PlaylistsAPI.remove(playlistID);
          },
        }),
        PredefinedMenuItem.new({ item: 'Separator' }),
        MenuItem.new({
          text: 'Duplicate',
          action: async () => {
            await PlaylistsAPI.duplicate(playlistID);
          },
        }),
        PredefinedMenuItem.new({ item: 'Separator' }),
        MenuItem.new({
          text: 'Export',
          action: async () => {
            await database.exportPlaylist(playlistID);
          },
        }),
      ]);

      const menu = await Menu.new({
        items: menuItems,
      });

      await menu.popup().catch(logAndNotifyError);
    },
    [],
  );

  const createPlaylist = useCallback(async () => {
    // TODO: 'new playlist 1', 'new playlist 2' ...
    await PlaylistsAPI.create('New playlist', [], false);
  }, []);

  const rename = useCallback(async (playlistID: string, name: string) => {
    await PlaylistsAPI.rename(playlistID, name);
  }, []);

  const keyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.persist();

      switch (e.nativeEvent.code) {
        case 'Enter': {
          // Enter
          if (renamed && e.currentTarget) {
            await rename(renamed, e.currentTarget.value);
            setRenamed(null);
          }
          break;
        }
        case 'Escape': {
          // Escape
          setRenamed(null);
          break;
        }
        default: {
          break;
        }
      }
    },
    [rename, renamed],
  );

  const blur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      if (renamed) {
        await rename(renamed, e.currentTarget.value);
      }

      setRenamed(null);
    },
    [rename, renamed],
  );

  const focus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  const { playlists } = props;

  const nav = playlists.map((elem) => {
    let navItemContent;

    if (elem._id === renamed) {
      navItemContent = (
        <input
          className={styles.item__input}
          type="text"
          defaultValue={elem.name}
          onKeyDown={keyDown}
          onBlur={blur}
          onFocus={focus}
          ref={(ref) => ref?.focus()}
        />
      );
    } else {
      navItemContent = (
        <PlaylistsNavLink
          className={styles.item__link}
          playlistID={elem._id}
          onContextMenu={showContextMenu}
        >
          {elem.name}
        </PlaylistsNavLink>
      );
    }

    return <div key={`playlist-${elem._id}`}>{navItemContent}</div>;
  });

  return (
    <div className={styles.playlistsNav}>
      <div className={styles.playlistsNav__header}>
        <h4 className={styles.playlistsNav__title}>Playlists</h4>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            onClick={createPlaylist}
            title="New playlist"
            data-museeks-action
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      <div className={styles.playlistsNav__body}>{nav}</div>
    </div>
  );
}

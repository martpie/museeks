import { Menu, MenuItem, PredefinedMenuItem } from '@tauri-apps/api/menu';
import type React from 'react';
import { useCallback, useState } from 'react';

import type { Playlist } from '../../generated/typings';
import database from '../../lib/database';
import { logAndNotifyError } from '../../lib/utils';
import PlaylistsAPI from '../../stores/PlaylistsAPI';

import { useNavigate } from 'react-router-dom';
import ButtonIcon from '../../elements/ButtonIcon/ButtonIcon';
import Flexbox from '../../elements/Flexbox/Flexbox';
import useInvalidate from '../../hooks/useInvalidate';
import SideNavLink from '../SideNavLink/SideNavLink';
import styles from './SideNav.module.css';

type Props = {
  title: string;
  playlists: Playlist[];
};

// TODO: finish making this component playlist agnostic
export default function SideNav(props: Props) {
  const invalidate = useInvalidate();
  const navigate = useNavigate();

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
            invalidate();
          },
        }),
        PredefinedMenuItem.new({ item: 'Separator' }),
        MenuItem.new({
          text: 'Duplicate',
          action: async () => {
            await PlaylistsAPI.duplicate(playlistID);
            invalidate();
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
    [invalidate],
  );

  const createPlaylist = useCallback(async () => {
    // TODO: 'new playlist 1', 'new playlist 2' ...
    const playlist = await PlaylistsAPI.create('New playlist', [], false);

    if (playlist) {
      invalidate();
      navigate(`/playlists/${playlist._id}`);
    }
  }, [navigate, invalidate]);

  const onRename = useCallback(
    async (playlistID: string, name: string) => {
      await PlaylistsAPI.rename(playlistID, name);
      invalidate();
    },
    [invalidate],
  );

  const keyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.persist();

      switch (e.nativeEvent.code) {
        case 'Enter': {
          // Enter
          if (renamed && e.currentTarget) {
            await onRename(renamed, e.currentTarget.value);
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
    [onRename, renamed],
  );

  const blur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      if (renamed) {
        await onRename(renamed, e.currentTarget.value);
      }

      setRenamed(null);
    },
    [onRename, renamed],
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
        <SideNavLink
          className={styles.item__link}
          playlistID={elem._id}
          onContextMenu={showContextMenu}
        >
          {elem.name}
        </SideNavLink>
      );
    }

    return <div key={elem._id}>{navItemContent}</div>;
  });

  return (
    <div className={styles.sideNav}>
      <Flexbox gap={8} align="center">
        <h4 className={styles.sideNav__title}>{props.title}</h4>
        <div className={styles.sideNav__actions}>
          <ButtonIcon
            icon="plus"
            onClick={createPlaylist}
            title="New Playlist"
          />
        </div>
      </Flexbox>
      <div className={styles.sideNav__body}>{nav}</div>
    </div>
  );
}

/* eslint-disable jsx-a11y/no-autofocus */

import type { MenuItemConstructorOptions } from 'electron';
import React, { useCallback, useState } from 'react';
import Icon from 'react-fontawesome';

import PlaylistsAPI from '../../stores/PlaylistsAPI';
import PlaylistsNavLink from '../PlaylistsNavLink/PlaylistsNavLink';
import { PlaylistModel } from '../../../shared/types/museeks';

import styles from './PlaylistsNav.module.css';

const { Menu } = window.MuseeksAPI.remote;

type Props = {
  playlists: PlaylistModel[];
};

export default function PlaylistsNav(props: Props) {
  const [renamed, setRenamed] = useState<string | null>(null);

  const showContextMenu = useCallback((playlistId: string) => {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'Rename',
        click: () => {
          setRenamed(playlistId);
        },
      },
      {
        label: 'Delete',
        click: async () => {
          await PlaylistsAPI.remove(playlistId);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Duplicate',
        click: async () => {
          await PlaylistsAPI.duplicate(playlistId);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Export',
        click: async () => {
          await PlaylistsAPI.exportToM3u(playlistId);
        },
      },
    ];

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }, []);

  const createPlaylist = useCallback(async () => {
    // Todo 'new playlist 1', 'new playlist 2' ...
    await PlaylistsAPI.create('New playlist', [], false, true);
  }, []);

  const rename = useCallback(async (_id: string, name: string) => {
    await PlaylistsAPI.rename(_id, name);
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

  // TODO (y.solovyov): extract into separate method that returns items
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
          autoFocus
        />
      );
    } else {
      navItemContent = (
        <PlaylistsNavLink
          className={styles.item__link}
          playlistId={elem._id}
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
            className={styles.action}
            onClick={createPlaylist}
            title="New playlist"
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      <div className={styles.playlistsNav__body}>{nav}</div>
    </div>
  );
}

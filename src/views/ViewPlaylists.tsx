import { useCallback, useMemo } from 'react';
import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import SideNav from '../components/SideNav/SideNav';
import ButtonIcon from '../elements/ButtonIcon/ButtonIcon';
import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';

import type {
  MenuItemOptions,
  PredefinedMenuItemOptions,
} from '@tauri-apps/api/menu';
import SideNavLink from '../components/SideNavLink/SideNavLink';
import useInvalidate from '../hooks/useInvalidate';
import type { LoaderData } from '../types/museeks';
import appStyles from './Root.module.css';
import styles from './ViewPlaylists.module.css';

export default function ViewPlaylists() {
  const { playlists } = useLoaderData() as PlaylistsLoaderData;
  const invalidate = useInvalidate();
  const navigate = useNavigate();

  const createPlaylist = useCallback(async () => {
    // TODO: 'new playlist 1', 'new playlist 2' ...
    const playlist = await PlaylistsAPI.create('New playlist', [], false);

    if (playlist) {
      invalidate();
      navigate(`/playlists/${playlist._id}`);
    }
  }, [navigate, invalidate]);

  const renamePlaylist = useCallback(
    async (playlistID: string, name: string) => {
      await PlaylistsAPI.rename(playlistID, name);
      invalidate();
    },
    [invalidate],
  );

  const sideNavItems = useMemo(() => {
    return playlists.map((playlist) => {
      const contextMenuItems: Array<
        MenuItemOptions | PredefinedMenuItemOptions
      > = [
        {
          text: 'Delete',
          action: async () => {
            await PlaylistsAPI.remove(playlist._id);
            invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: 'Duplicate',
          action: async () => {
            await PlaylistsAPI.duplicate(playlist._id);
            invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: 'Export',
          action: async () => {
            await database.exportPlaylist(playlist._id);
          },
        },
      ];

      return (
        <SideNavLink
          key={playlist._id}
          label={playlist.name}
          id={playlist._id}
          href={`/playlists/${playlist._id}`}
          onRename={renamePlaylist}
          contextMenuItems={contextMenuItems}
        />
      );
    });
  }, [playlists, renamePlaylist, invalidate]);

  // Empty and List states
  let playlistContent;

  if (playlists.length === 0) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>You haven{"'"}t created any playlist yet</p>
        <ViewMessage.Sub>
          <button
            type="button"
            onClick={createPlaylist}
            className="reset"
            tabIndex={0}
          >
            create one now
          </button>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  } else {
    playlistContent = <Outlet />;
  }

  return (
    <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
      <SideNav
        title="Playlists"
        actions={
          <ButtonIcon
            icon="plus"
            onClick={createPlaylist}
            title="New Playlist"
          />
        }
      >
        {sideNavItems}
      </SideNav>
      <div className={styles.playlist}>{playlistContent}</div>
    </div>
  );
}

export type PlaylistsLoaderData = LoaderData<typeof ViewPlaylists.loader>;

ViewPlaylists.loader = async ({ params }: LoaderFunctionArgs) => {
  const playlists = await database.getAllPlaylists();
  const [firstPlaylist] = playlists;
  const { playlistID } = params;

  if (
    // If landing page, redirect to the first playlist
    playlistID === undefined ||
    // If playlist ID does not exist, redirect to the first playlist
    (playlistID !== undefined &&
      !playlists.map((playlist) => playlist._id).includes(playlistID))
  ) {
    if (firstPlaylist !== undefined) {
      return redirect(`/playlists/${firstPlaylist._id}`);
    }
  }

  return { playlists };
};

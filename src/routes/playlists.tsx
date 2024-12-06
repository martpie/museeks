import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import type {
  MenuItemOptions,
  PredefinedMenuItemOptions,
} from '@tauri-apps/api/menu';
import { useCallback, useMemo } from 'react';

import SideNav from '../components/SideNav';
import SideNavLink from '../components/SideNavLink';
import ButtonIcon from '../elements/ButtonIcon';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import useInvalidate from '../hooks/useInvalidate';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';

export const Route = createFileRoute('/playlists')({
  component: ViewPlaylists,
  loader,
});

export default function ViewPlaylists() {
  const { playlists } = Route.useLoaderData();
  const invalidate = useInvalidate();
  const navigate = useNavigate();

  const createPlaylist = useCallback(async () => {
    // TODO: 'new playlist 1', 'new playlist 2' ...
    const playlist = await PlaylistsAPI.create('New playlist', [], false);

    if (playlist) {
      invalidate();
      navigate({
        to: '/playlists/$playlistID',
        params: { playlistID: playlist.id },
      });
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
            await PlaylistsAPI.remove(playlist.id);

            // FIXME router
            // Redirect to /playlists if we are deleting the current playlist
            // if (params.playlistID === playlist.id) {
            //   navigate('/playlists');
            // }

            invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: 'Duplicate',
          action: async () => {
            await PlaylistsAPI.duplicate(playlist.id);
            invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: 'Export',
          action: async () => {
            await database.exportPlaylist(playlist.id);
          },
        },
      ];

      return (
        <SideNavLink
          key={playlist.id}
          label={playlist.name}
          id={playlist.id}
          href={`/playlists/${playlist.id}`}
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
    <View
      sideNav={
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
      }
    >
      {playlistContent}
    </View>
  );
}

async function loader() {
  const playlists = await database.getAllPlaylists();
  // const [firstPlaylist] = playlists;
  // FIXME router
  // const { playlistID } = params;

  // if (
  //   // If landing page, redirect to the first playlist
  //   playlistID === undefined ||
  //   // If playlist ID does not exist, redirect to the first playlist
  //   (playlistID !== undefined &&
  //     !playlists.map((playlist) => playlist.id).includes(playlistID))
  // ) {
  //   if (firstPlaylist !== undefined) {
  //     return redirect(`/playlists/${firstPlaylist.id}`);
  //   }
  // }

  return { playlists };
}

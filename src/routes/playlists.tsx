import {
  Outlet,
  createFileRoute,
  redirect,
  useMatch,
  useNavigate,
} from '@tanstack/react-router';
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
import usePlayerStore from '../stores/usePlayerStore';

export const Route = createFileRoute('/playlists')({
  component: ViewPlaylists,
  beforeLoad: async ({ params }) => {
    const playlists = await database.getAllPlaylists();
    const queueOrigin = usePlayerStore.getState().queueOrigin;

    if (!('playlistID' in params) && playlists.length > 0) {
      // If there is a playing Playlist, redirect to it
      if (queueOrigin?.type === 'playlist') {
        throw redirect({
          to: '/playlists/$playlistID',
          params: { playlistID: queueOrigin.playlistID },
        });
      }

      throw redirect({
        to: '/playlists/$playlistID',
        params: { playlistID: playlists[0].id },
      });
    }

    return { playlists };
  },
  loader: async ({ context }) => {
    return context;
  },
});

function ViewPlaylists() {
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

  const childPlaylistMatch = useMatch({
    from: '/playlists/$playlistID',
    shouldThrow: false,
  });

  const sideNavItems = useMemo(() => {
    return playlists.map((playlist) => {
      const contextMenuItems: Array<
        MenuItemOptions | PredefinedMenuItemOptions
      > = [
        {
          text: 'Delete',
          action: async () => {
            await PlaylistsAPI.remove(playlist.id);

            // Redirect to /playlists if we are deleting the current playlist
            if (childPlaylistMatch?.params.playlistID === playlist.id) {
              navigate({ to: '/playlists' });
            }

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
  }, [playlists, renamePlaylist, invalidate, navigate, childPlaylistMatch]);

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
  } else if (!childPlaylistMatch) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>No playlist selected</p>
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

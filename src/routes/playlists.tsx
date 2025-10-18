import { Trans, useLingui } from '@lingui/react/macro';
import {
  createFileRoute,
  Outlet,
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
import Link from '../elements/Link';
import View from '../elements/View';
import * as ViewMessage from '../elements/ViewMessage';
import useInvalidate from '../hooks/useInvalidate';
import DatabaseBridge from '../lib/bridge-database';
import player from '../lib/player';
import PlaylistsAPI from '../stores/PlaylistsAPI';

export const Route = createFileRoute('/playlists')({
  component: ViewPlaylists,
  beforeLoad: async ({ params }) => {
    const playlists = await DatabaseBridge.getAllPlaylists();
    const queueOrigin = player.getQueueOrigin();

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
  const { t } = useLingui();

  const invalidate = useInvalidate();
  const navigate = useNavigate();

  const createPlaylist = useCallback(async () => {
    // TODO: 'new playlist 1', 'new playlist 2' ...
    const playlist = await PlaylistsAPI.create(t`New playlist`, [], false);

    if (playlist) {
      await invalidate();
      navigate({
        to: '/playlists/$playlistID',
        params: { playlistID: playlist.id },
      });
    }
  }, [navigate, invalidate, t]);

  const renamePlaylist = useCallback(
    async (playlistID: string, name: string) => {
      await PlaylistsAPI.rename(playlistID, name);
      await invalidate();
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
          text: t`Delete`,
          action: async () => {
            await PlaylistsAPI.remove(playlist.id);

            await invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: t`Duplicate`,
          action: async () => {
            await PlaylistsAPI.duplicate(playlist.id);
            await invalidate();
          },
        },
        { item: 'Separator' },
        {
          text: t`Export`,
          action: async () => {
            await DatabaseBridge.exportPlaylist(playlist.id);
          },
        },
      ];

      return (
        <SideNavLink
          key={playlist.id}
          label={playlist.name}
          id={playlist.id}
          linkOptions={{
            to: '/playlists/$playlistID',
            params: { playlistID: playlist.id },
          }}
          onRename={renamePlaylist}
          contextMenuItems={contextMenuItems}
        />
      );
    });
  }, [playlists, renamePlaylist, invalidate, t]);

  // Empty and List states
  let playlistContent;

  if (playlists.length === 0) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>
          <Trans>You haven{"'"}t created any playlist yet</Trans>
        </p>
        <ViewMessage.Sub>
          <Link onClick={createPlaylist}>
            <Trans>create one now</Trans>
          </Link>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  } else if (!childPlaylistMatch) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>
          <Trans>No playlist selected</Trans>
        </p>
      </ViewMessage.Notice>
    );
  } else {
    playlistContent = <Outlet />;
  }

  return (
    <View
      sideNav={
        <SideNav
          title={t`Playlists`}
          actions={
            <ButtonIcon
              icon="plus"
              onClick={createPlaylist}
              title={t`New Playlist`}
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

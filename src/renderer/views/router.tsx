import { createHashRouter, redirect } from 'react-router-dom';

import { PlaylistModel, TrackModel } from '../../shared/types/museeks';

import RootView from './Root';
import LibraryView from './Library/Library';
import PlaylistsView from './Playlists/Playlists';
import PlaylistView from './Playlists/Playlist';
import SettingsView from './Settings/Settings';
import SettingsLibrary from './Settings/SettingsLibrary';
import SettingsUI from './Settings/SettingsUI';
import SettingsAudio from './Settings/SettingsAudio';
import SettingsAbout from './Settings/SettingsAbout';
import DetailsView from './Details/Details';

const { db } = window.MuseeksAPI;

const router = createHashRouter([
  {
    path: '/',
    id: 'root',
    element: <RootView />,
    loader: async (): Promise<LoaderResponse<RootLoaderResponse>> => {
      // this can be slow, think about caching it or something, especially when
      // we revalidate routing
      const tracks = await db.tracks.getAll();
      return { tracks };
    },
    children: [
      {
        path: 'library',
        id: 'library',
        element: <LibraryView />,
        loader: async (): Promise<LoaderResponse<LibraryLoaderResponse>> => {
          const playlists = await db.playlists.getAll();

          return {
            playlists,
          };
        },
      },
      {
        path: 'playlists',
        id: 'playlists',
        element: <PlaylistsView />,
        loader: async ({
          params,
        }): Promise<LoaderResponse<PlaylistsLoaderResponse>> => {
          const playlists = await db.playlists.getAll();
          const [firstPlaylist] = playlists;
          const { playlistId } = params;

          if (
            // If landing page, redirect to the first playlist
            playlistId === undefined ||
            // If playlist ID does not exist, redirect to the first playlist
            (playlistId !== undefined &&
              !playlists.map((playlist) => playlist._id).includes(playlistId))
          ) {
            if (firstPlaylist !== undefined) {
              return redirect(`/playlists/${firstPlaylist._id}`);
            }
          }

          return { playlists };
        },
        children: [
          {
            path: ':playlistId',
            id: 'playlist-details',
            element: <PlaylistView />,
            loader: async ({
              params,
            }): Promise<LoaderResponse<PlaylistLoaderResponse>> => {
              if (typeof params.playlistId !== 'string') {
                throw new Error('Playlist ID is not defined');
              }

              const playlist = await db.playlists.findOnlyByID(
                params.playlistId,
              );
              return {
                // TODO: can we re-use parent's data?
                playlists: await db.playlists.getAll(),
                playlistTracks: await db.tracks.findByID(playlist.tracks),
              };
            },
          },
        ],
      },
      {
        path: 'settings',
        element: <SettingsView />,
        children: [
          { path: 'library', element: <SettingsLibrary /> },
          { path: 'interface', element: <SettingsUI /> },
          { path: 'audio', element: <SettingsAudio /> },
          { path: 'about', element: <SettingsAbout /> },
        ],
      },
      {
        path: 'details/:trackId',
        element: <DetailsView />,
      },
    ],
  },
]);

export default router;

/**
 * Loader Types, to manually type useLoaderData()
 */
type LoaderResponse<T> = Response | T;

export type RootLoaderResponse = {
  tracks: TrackModel[];
};

export type LibraryLoaderResponse = {
  playlists: PlaylistModel[];
};

export type PlaylistsLoaderResponse = {
  playlists: PlaylistModel[];
};

export type PlaylistLoaderResponse = {
  playlistTracks: TrackModel[];
  playlists: PlaylistModel[];
};

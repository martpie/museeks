import {
  createHashRouter,
  isRouteErrorResponse,
  redirect,
  useRouteError,
} from 'react-router-dom';

import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import ExternalLink from '../elements/ExternalLink/ExternalLink';
import { Config, PlaylistModel, TrackModel } from '../../shared/types/museeks';
import logger from '../../shared/lib/logger';

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
    ErrorBoundary: GlobalErrorBoundary,
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
        id: 'settings',
        element: <SettingsView />,
        loader: async (): Promise<LoaderResponse<SettingsLoaderResponse>> => {
          const config = await window.MuseeksAPI.config.getAll();

          return {
            config,
          };
        },
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
 * Components helpers
 */

function GlobalErrorBoundary() {
  const error = useRouteError();
  logger.error(error);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.error?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <ViewMessage.Notice>
      <p>
        <span role="img" aria-label="boom">
          💥
        </span>{' '}
        Something wrong happened: {errorMessage}
      </p>
      <ViewMessage.Sub>
        If it happens again, please{' '}
        <ExternalLink href="https://github.com/martpie/museeks/issues">
          report an issue
        </ExternalLink>
      </ViewMessage.Sub>
    </ViewMessage.Notice>
  );
}

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

export type SettingsLoaderResponse = {
  config: Config;
};

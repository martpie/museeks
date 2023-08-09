import { useRouteLoaderData } from 'react-router-dom';
import { useMemo } from 'react';

import { TrackModel } from '../../shared/types/museeks';
import { RootLoaderData } from '../views/Root';
import { PlaylistLoaderData } from '../views/Playlists/Playlist';

import useFilteredTracks from './useFilteredTracks';

type Maybe<T> = T | undefined;

/**
 * Hook that returns the current view tracks (library or playlist)
 */
export default function useCurrentViewTracks(): TrackModel[] {
  // TODO: how to support Settings page? Should we?
  const rootData = useRouteLoaderData('root') as Maybe<RootLoaderData>;
  const filteredLibraryTracks = useFilteredTracks(
    (rootData && rootData.tracks) ?? [],
  );
  const playlistData = useRouteLoaderData(
    'playlist-details',
  ) as Maybe<PlaylistLoaderData>;

  const tracks = useMemo(() => {
    if (playlistData) {
      return playlistData.playlistTracks;
    }

    if (rootData) {
      return filteredLibraryTracks;
    }

    return [];
  }, [filteredLibraryTracks, rootData, playlistData]);

  return tracks;
}

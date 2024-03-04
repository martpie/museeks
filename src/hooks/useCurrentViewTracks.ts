import { useRouteLoaderData } from 'react-router-dom';
import { useMemo } from 'react';

import { Track } from '../generated/typings';
import { PlaylistLoaderData } from '../views/ViewPlaylistDetails';
import { LibraryLoaderData } from '../views/ViewLibrary';

import useFilteredTracks from './useFilteredTracks';

type Maybe<T> = T | undefined;

/**
 * Hook that returns the current view tracks (library or playlist)
 */
export default function useCurrentViewTracks(): Track[] {
  // TODO: how to support Settings page? Should we?
  const libraryData = useRouteLoaderData('library') as Maybe<LibraryLoaderData>;
  const filteredLibraryTracks = useFilteredTracks(
    (libraryData && libraryData.tracks) ?? [],
  );
  const playlistData = useRouteLoaderData(
    'playlist-details',
  ) as Maybe<PlaylistLoaderData>;

  const tracks = useMemo(() => {
    if (playlistData) {
      return playlistData.playlistTracks;
    }

    if (libraryData) {
      return filteredLibraryTracks;
    }

    return [];
  }, [filteredLibraryTracks, libraryData, playlistData]);

  return tracks;
}

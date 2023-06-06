import { useRouteLoaderData } from 'react-router';
import { useMemo } from 'react';

import { TrackModel } from '../../shared/types/museeks';
import { LibraryLoaderResponse, PlaylistLoaderResponse } from '../views/router';

import useFilteredTracks from './useFilteredTracks';

type Maybe<T> = T | undefined;

/**
 * Hook that returns the current view tracks (library or playlist)
 */
export default function useCurrentViewTracks(): TrackModel[] {
  // TODO: how to support Settings page? Should we?
  const libraryData = useRouteLoaderData('library') as Maybe<LibraryLoaderResponse>;
  const filteredLibraryTracks = useFilteredTracks((libraryData && libraryData.tracks) ?? []);
  const playlistData = useRouteLoaderData('playlist-details') as Maybe<PlaylistLoaderResponse>;

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

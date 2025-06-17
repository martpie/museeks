import { useMemo } from 'react';
import type {
  SortBy,
  SortOrder,
  Track,
  TrackGroup,
} from '../generated/typings';
import {
  filterTracks,
  getSortOrder,
  sortTracks,
  stripAccents,
} from '../lib/utils-library';
import useLibraryStore from '../stores/useLibraryStore';
/**
 * Filter and Sort a list of tracks depending on the user preferences and search
 * IMPORTANT: can only be used ONCE per view, as it has side effects
 */
export default function useFilteredTracks(
  tracks: Array<Track>,
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): Array<Track> {
  const search = useLibraryStore((state) => stripAccents(state.search));

  return useMemo(() => {
    // 1. Raw List
    let searchedTracks: Array<Track> = filterTracks(tracks, search);

    if (sortBy && sortOrder) {
      // sorting being a costly operation, do it after filtering, ignore it if not needed
      searchedTracks = sortTracks(
        searchedTracks,
        getSortOrder(sortBy),
        sortOrder,
      );
    }

    return searchedTracks;
  }, [tracks, search, sortBy, sortOrder]);
}

/**
 * Filter and Sort a list of tracks groups depending on the user preferences and
 * search
 * IMPORTANT: can only be used ONCE per view, as it has side effects
 */
export function useFilteredTrackGroup(
  tracks: Array<TrackGroup>,
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): Array<TrackGroup> {
  const search = useLibraryStore((state) => stripAccents(state.search));

  return useMemo(() => {
    let searchedGroups: Array<TrackGroup> = tracks.map((group) => {
      return {
        ...group,
        tracks: filterTracks(group.tracks, search),
      };
    });

    if (sortBy && sortOrder) {
      // sorting being a costly operation, do it after filtering, ignore it if not needed
      searchedGroups = searchedGroups.map((group) => {
        return {
          label: group.label,
          tracks: sortTracks(group.tracks, getSortOrder(sortBy), sortOrder),
        };
      });
    }

    return searchedGroups;
  }, [tracks, search, sortBy, sortOrder]);
}

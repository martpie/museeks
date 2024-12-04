import { useEffect, useMemo } from 'react';

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
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

/**
 * Filter and Sort a list of tracks depending on the user preferences and search
 * IMPORTANT: can only be used ONCE per view, as it has side effects
 */
export default function useFilteredTracks(
  tracks: Track[],
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): Track[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const libraryAPI = useLibraryAPI();

  const filteredTracks = useMemo(() => {
    let searchedTracks = filterTracks(tracks, search);

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

  // Update the footer status based on the displayed tracks
  useEffect(() => {
    libraryAPI.setTracksStatus(filteredTracks);

    return () => {
      libraryAPI.setTracksStatus(null);
    };
  }, [filteredTracks, libraryAPI.setTracksStatus]);

  return filteredTracks;
}

/**
 * Filter and Sort a list of tracks groups depending on the user preferences and
 * search
 * IMPORTANT: can only be used ONCE per view, as it has side effects
 */
export function useFilteredTrackGroup(
  tracks: TrackGroup[],
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): TrackGroup[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const libraryAPI = useLibraryAPI();

  const filteredTrackGroup: TrackGroup[] = useMemo(() => {
    let searchedGroups = tracks.map((group) => {
      return {
        label: group.label,
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

  // Update the footer status based on the displayed tracks
  useEffect(() => {
    libraryAPI.setTracksStatus(
      filteredTrackGroup.flatMap((group) => group.tracks),
    );

    return () => {
      libraryAPI.setTracksStatus(null);
    };
  }, [filteredTrackGroup, libraryAPI.setTracksStatus]);

  return filteredTrackGroup;
}

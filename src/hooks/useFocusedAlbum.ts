import { useEffect } from 'react';

export type FocusedAlbumSearch = {
  focused_album?: string;
};

export function validateFocusedAlbumSearch(
  search: Record<string, unknown>,
): FocusedAlbumSearch {
  const album =
    typeof search?.focused_album === 'string'
      ? search.focused_album
      : undefined;
  return album ? { focused_album: album } : {};
}

export default function useFocusedAlbum(focusedAlbum: string | undefined) {
  useEffect(() => {
    if (focusedAlbum) {
      const element = document.querySelector(
        `[data-track-group="${encodeURIComponent(focusedAlbum)}"]`,
      );
      element?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [focusedAlbum]);
}

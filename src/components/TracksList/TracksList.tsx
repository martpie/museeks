import { useVirtualizer } from '@tanstack/react-virtual';
import { invoke } from '@tauri-apps/api/core';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';
import { useNavigate } from 'react-router-dom';

import type { Config, Playlist, Track } from '../../generated/typings';
import { logAndNotifyError } from '../../lib/utils';
import {
  isAltKey,
  isCtrlKey,
  isLeftClick,
  isRightClick,
} from '../../lib/utils-events';
import PlaylistsAPI from '../../stores/PlaylistsAPI';
import useLibraryStore, { useLibraryAPI } from '../../stores/useLibraryStore';
import { usePlayerAPI } from '../../stores/usePlayerStore';
import TrackRow from '../TrackRow/TrackRow';
import TracksListHeader from '../TracksListHeader/TracksListHeader';

import useInvalidate from '../../hooks/useInvalidate';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';
import styles from './TracksList.module.css';

const ROW_HEIGHT = 30;
const ROW_HEIGHT_COMPACT = 24;

// --------------------------------------------------------------------------
// TrackList
// --------------------------------------------------------------------------

type Props = {
  type: string;
  tracks: Track[];
  tracksDensity: Config['track_view_density'];
  trackPlayingID: string | null;
  playlists: Playlist[];
  currentPlaylist?: string;
  reorderable?: boolean;
  onReorder?: (
    playlistID: string,
    tracksIDs: string[],
    targetTrackID: string,
    position: 'above' | 'below',
  ) => void;
};

export default function TracksList(props: Props) {
  const {
    tracks,
    type,
    tracksDensity,
    trackPlayingID,
    reorderable,
    currentPlaylist,
    onReorder,
    playlists,
  } = props;

  const [selected, setSelected] = useState<string[]>([]);
  const [reordered, setReordered] = useState<string[] | null>([]);

  const navigate = useNavigate();
  const invalidate = useInvalidate();

  // Scrollable element for the virtual list + virtualizer
  const scrollableRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tracks.length,
    overscan: 20,
    scrollPaddingEnd: 22, // Height of the track list header
    getScrollElement: () => scrollableRef.current,
    estimateSize: () => {
      switch (tracksDensity) {
        case 'compact':
          return ROW_HEIGHT_COMPACT;
        default:
          return ROW_HEIGHT;
      }
    },
    getItemKey: (index) => tracks[index]._id,
  });

  const playerAPI = usePlayerAPI();
  const libraryAPI = useLibraryAPI();
  const highlight = useLibraryStore((state) => state.highlightPlayingTrack);
  useScrollRestoration(scrollableRef);

  // Highlight playing track and scroll to it
  // Super-mega-hacky to use Redux for that
  useEffect(() => {
    if (highlight === true && trackPlayingID) {
      setSelected([trackPlayingID]);

      const playingTrackIndex = tracks.findIndex(
        (track) => track._id === trackPlayingID,
      );

      if (playingTrackIndex >= 0) {
        virtualizer.scrollToIndex(playingTrackIndex, { behavior: 'smooth' });
      }

      libraryAPI.highlightPlayingTrack(false);
    }
  }, [highlight, trackPlayingID, tracks, libraryAPI, virtualizer]);

  /**
   * Helpers
   */
  const startPlayback = useCallback(
    async (trackID: string) => {
      playerAPI.start(tracks, trackID);
    },
    [tracks, playerAPI],
  );

  /**
   * Keyboard navigations events/helpers
   */
  const onEnter = useCallback(
    async (index: number, tracks: Track[]) => {
      if (index !== -1) playerAPI.start(tracks, tracks[index]._id);
    },
    [playerAPI],
  );

  const onControlAll = useCallback((tracks: Track[]) => {
    setSelected(tracks.map((track) => track._id));
  }, []);

  const onUp = useCallback(
    (index: number, tracks: Track[], shiftKeyPressed: boolean) => {
      const addedIndex = Math.max(0, index - 1);

      // Add to the selection if shift key is pressed
      let newSelected = selected;

      if (shiftKeyPressed) newSelected = [tracks[addedIndex]._id, ...selected];
      else newSelected = [tracks[addedIndex]._id];

      setSelected(newSelected);
      virtualizer.scrollToIndex(addedIndex);
    },
    [selected, virtualizer],
  );

  const onDown = useCallback(
    (index: number, tracks: Track[], shiftKeyPressed: boolean) => {
      const addedIndex = Math.min(tracks.length - 1, index + 1);

      // Add to the selection if shift key is pressed
      let newSelected = selected;
      if (shiftKeyPressed) newSelected = [...selected, tracks[addedIndex]._id];
      else newSelected = [tracks[addedIndex]._id];

      setSelected(newSelected);
      virtualizer.scrollToIndex(addedIndex);
    },
    [selected, virtualizer],
  );

  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      let firstSelectedTrackID = tracks.findIndex((track) =>
        selected.includes(track._id),
      );

      switch (e.code) {
        case 'KeyA':
          if (isCtrlKey(e)) {
            onControlAll(tracks);
            e.preventDefault();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          onUp(firstSelectedTrackID, tracks, e.shiftKey);
          break;

        case 'ArrowDown':
          // This effectively becomes lastSelectedTrackID
          firstSelectedTrackID = tracks.findIndex(
            (track) => selected[selected.length - 1] === track._id,
          );
          e.preventDefault();
          onDown(firstSelectedTrackID, tracks, e.shiftKey);
          break;

        case 'Enter':
          e.preventDefault();
          await onEnter(firstSelectedTrackID, tracks);
          break;

        default:
          break;
      }
    },
    [onControlAll, onDown, onUp, onEnter, selected, tracks],
  );

  /**
   * Playlists re-order events handlers
   */
  const onReorderStart = useCallback(() => setReordered(selected), [selected]);
  const onReorderEnd = useCallback(() => setReordered(null), []);

  const onDrop = useCallback(
    async (targetTrackID: string, position: 'above' | 'below') => {
      if (onReorder && currentPlaylist && reordered) {
        onReorder(currentPlaylist, reordered, targetTrackID, position);
      }
    },
    [currentPlaylist, onReorder, reordered],
  );

  /**
   * Tracks selection
   */
  const isSelectableTrack = useCallback(
    (id: string) => !selected.includes(id),
    [selected],
  );

  const sortSelected = useCallback(
    (a: string, b: string): number => {
      const allTracksIDs = tracks.map((track) => track._id);

      return allTracksIDs.indexOf(a) - allTracksIDs.indexOf(b);
    },
    [tracks],
  );

  const toggleSelectionByID = useCallback(
    (id: string) => {
      let newSelected = [...selected];

      if (newSelected.includes(id)) {
        // remove track
        newSelected.splice(newSelected.indexOf(id), 1);
      } else {
        // add track
        newSelected.push(id);
      }

      newSelected = newSelected.sort(sortSelected);
      setSelected(newSelected);
    },
    [selected, sortSelected],
  );

  const multiSelect = useCallback(
    (index: number) => {
      const selectedInt = [];

      // Prefer destructuring
      for (let i = 0; i < tracks.length; i++) {
        if (selected.includes(tracks[i]._id)) {
          selectedInt.push(i);
        }
      }

      let base;
      const min = Math.min(...selectedInt);
      const max = Math.max(...selectedInt);

      if (index < min) {
        base = max;
      } else {
        base = min;
      }

      const newSelected = [];

      if (index < min) {
        for (let i = 0; i <= Math.abs(index - base); i++) {
          newSelected.push(tracks[base - i]._id);
        }
      } else if (index > max) {
        for (let i = 0; i <= Math.abs(index - base); i++) {
          newSelected.push(tracks[base + i]._id);
        }
      }

      setSelected(newSelected.sort(sortSelected));
    },
    [selected, sortSelected, tracks],
  );

  const selectTrack = useCallback(
    (event: React.MouseEvent, trackID: string, index: number) => {
      // To allow selection drag-and-drop, we need to prevent track selection
      // when selection a track that is already selected
      if (
        selected.includes(trackID) &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey
      ) {
        return;
      }

      if (
        isLeftClick(event) ||
        (isRightClick(event) && isSelectableTrack(trackID))
      ) {
        if (isCtrlKey(event)) {
          toggleSelectionByID(trackID);
        } else if (event.shiftKey) {
          if (selected.length === 0) {
            const newSelected = [trackID];
            setSelected(newSelected);
          } else {
            multiSelect(index);
          }
        } else {
          if (!isAltKey(event)) {
            const newSelected = [trackID];
            setSelected(newSelected);
          }
        }
      }
    },
    [selected, multiSelect, toggleSelectionByID, isSelectableTrack],
  );

  const selectTrackClick = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent, trackID: string) => {
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        selected.includes(trackID)
      ) {
        setSelected([trackID]);
      }
    },
    [selected],
  );

  /**
   * Context menus
   */
  const showContextMenu = useCallback(
    async (e: React.MouseEvent, index: number) => {
      e.preventDefault();

      const selectedCount = selected.length;
      const track = tracks[index];
      let shownPlaylists = playlists;

      // Hide current playlist if one the given playlist view
      if (type === 'playlist') {
        shownPlaylists = playlists.filter(
          (elem) => elem._id !== currentPlaylist,
        );
      }

      // Playlist sub-menu
      const playlistSubMenu = await Promise.all([
        MenuItem.new({
          text: 'Create new playlist...',
          async action() {
            await PlaylistsAPI.create('New playlist', selected);
            invalidate();
          },
        }),
        PredefinedMenuItem.new({
          item: 'Separator',
        }),
      ]);

      if (shownPlaylists.length === 0) {
        playlistSubMenu.push(
          await MenuItem.new({ text: 'No playlists', enabled: false }),
        );
      } else {
        playlistSubMenu.push(
          ...(await Promise.all(
            shownPlaylists.map((playlist) =>
              MenuItem.new({
                text: playlist.name,
                async action() {
                  await PlaylistsAPI.addTracks(playlist._id, selected);
                },
              }),
            ),
          )),
        );
      }

      const menuItems = await Promise.all([
        MenuItem.new({
          text:
            selectedCount > 1
              ? `${selectedCount} tracks selected`
              : `${selectedCount} track selected`,
          enabled: false,
        }),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
        MenuItem.new({
          text: 'Add to queue',
          action() {
            playerAPI.addInQueue(selected);
          },
        }),
        MenuItem.new({
          text: 'Play next',
          action() {
            playerAPI.addNextInQueue(selected);
          },
        }),
        PredefinedMenuItem.new({
          item: 'Separator',
        }),
        Submenu.new({
          text: 'Add to playlist',
          items: playlistSubMenu,
        }),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
      ]);

      menuItems.push(
        ...(await Promise.all(
          track.artists.map((artist) =>
            MenuItem.new({
              text: `Search for "${artist}" `,
              action: () => {
                libraryAPI.search(artist);
              },
            }),
          ),
        )),
      );

      menuItems.push(
        await MenuItem.new({
          text: `Search for "${track.album}"`,
          action() {
            libraryAPI.search(track.album);
          },
        }),
      );

      if (type === 'playlist' && currentPlaylist) {
        menuItems.push(
          ...(await Promise.all([
            PredefinedMenuItem.new({ item: 'Separator' }),
            MenuItem.new({
              text: 'Remove from playlist',
              async action() {
                await PlaylistsAPI.removeTracks(currentPlaylist, selected);
                invalidate();
              },
            }),
          ])),
        );
      }

      menuItems.push(
        ...(await Promise.all([
          PredefinedMenuItem.new({ item: 'Separator' }),
          MenuItem.new({
            text: 'Edit track',
            action: () => {
              navigate(`/details/${track._id}`);
            },
          }),
          PredefinedMenuItem.new({ item: 'Separator' }),
          MenuItem.new({
            text: 'Show in file manager',
            action: async () => {
              await invoke('plugin:shell-extension|show_item_in_folder', {
                path: track.path,
              });
            },
          }),
          MenuItem.new({
            text: 'Remove from library',
            action: async () => {
              await libraryAPI.remove(selected);
              invalidate();
            },
          }),
        ])),
      );

      const menu = await Menu.new({
        items: menuItems,
      });

      await menu.popup().catch(logAndNotifyError);
    },
    [
      currentPlaylist,
      playlists,
      selected,
      tracks,
      type,
      navigate,
      playerAPI,
      libraryAPI,
      invalidate,
    ],
  );

  return (
    <div className={styles.tracksList}>
      <Keybinding onKey={onKey} preventInputConflict />
      {/* Scrollable element */}
      <div ref={scrollableRef} className={styles.tracksListScroller}>
        <TracksListHeader enableSort={type === 'library'} />

        {/* The large inner element to hold all of the items */}
        <div
          className={styles.tracksListRows}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Only the visible items in the virtualizer, manually positioned to be in view */}
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const track = tracks[virtualItem.index];
            return (
              <TrackRow
                key={virtualItem.key}
                selected={selected.includes(track._id)}
                track={track}
                isPlaying={trackPlayingID === track._id}
                index={virtualItem.index}
                onMouseDown={selectTrack}
                onClick={selectTrackClick}
                onContextMenu={showContextMenu}
                onDoubleClick={startPlayback}
                draggable={reorderable}
                reordered={reordered?.includes(track._id) || false}
                onDragStart={onReorderStart}
                onDragEnd={onReorderEnd}
                onDrop={onDrop}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  // Intentionally not translateY, as it would create another paint
                  // layer where every row would cover elements from the previous one.
                  // This would typically prevent the drop effect to be properly displayed
                  // when reordering a playlist
                  top: `${virtualItem.start}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

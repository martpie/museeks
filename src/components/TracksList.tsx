import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';
import { useNavigate, useSearchParams } from 'react-router';

import type { Config, Playlist, Track } from '../generated/typings';
import { logAndNotifyError } from '../lib/utils';
import { isCtrlKey } from '../lib/utils-events';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { usePlayerAPI } from '../stores/usePlayerStore';
import TrackRow from './TrackRow';
import TracksListHeader from './TracksListHeader';

import { revealItemInDir } from '@tauri-apps/plugin-opener';
import useInvalidate from '../hooks/useInvalidate';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { keyboardSelect } from '../lib/utils-list';
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
    tracksIDs: Set<string>,
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

  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [reorderedTracks, setReorderedTracks] = useState<Set<string> | null>(
    new Set(),
  );

  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldJumpToPlayingTrack =
    searchParams.get('jump_to_playing_track') === 'true';

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
    getItemKey: (index) => tracks[index].id,
  });

  const playerAPI = usePlayerAPI();
  const libraryAPI = useLibraryAPI();
  useScrollRestoration(scrollableRef);

  // Highlight playing track and scroll to it
  useEffect(() => {
    if (shouldJumpToPlayingTrack && trackPlayingID) {
      setSearchParams(undefined);
      setSelectedTracks(new Set([trackPlayingID]));

      const playingTrackIndex = tracks.findIndex(
        (track) => track.id === trackPlayingID,
      );

      if (playingTrackIndex >= 0) {
        setTimeout(() => {
          // avoid conflict with scroll restoration
          virtualizer.scrollToIndex(playingTrackIndex, { behavior: 'smooth' });
        }, 0);
      }
    }
  }, [
    shouldJumpToPlayingTrack,
    setSearchParams,
    trackPlayingID,
    tracks,
    virtualizer.scrollToIndex,
  ]);

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
      if (index !== -1) playerAPI.start(tracks, tracks[index].id);
    },
    [playerAPI],
  );

  const onControlAll = useCallback((tracks: Track[]) => {
    setSelectedTracks(new Set(tracks.map((track) => track.id)));
  }, []);

  const onUp = useCallback(
    (index: number, tracks: Track[], shiftKeyPressed: boolean) => {
      const addedIndex = Math.max(0, index - 1);

      // Add to the selection if shift key is pressed
      let newSelected = selectedTracks;

      if (shiftKeyPressed)
        newSelected = new Set([tracks[addedIndex].id, ...selectedTracks]);
      else newSelected = new Set([tracks[addedIndex].id]);

      setSelectedTracks(newSelected);
      virtualizer.scrollToIndex(addedIndex);
    },
    [selectedTracks, virtualizer],
  );

  const onDown = useCallback(
    (index: number, tracks: Track[], shiftKeyPressed: boolean) => {
      const addedIndex = Math.min(tracks.length - 1, index + 1);
      // Add to the selection if shift key is pressed
      let newSelected: Set<string>;
      if (shiftKeyPressed)
        newSelected = new Set([...selectedTracks, tracks[addedIndex].id]);
      else newSelected = new Set([tracks[addedIndex].id]);
      setSelectedTracks(newSelected);
      virtualizer.scrollToIndex(addedIndex);
    },
    [selectedTracks, virtualizer],
  );

  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      const firstSelectedTrackID = tracks.findIndex((track) =>
        selectedTracks.has(track.id),
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

        case 'ArrowDown': {
          const lastSelectedTrackID = tracks.findLastIndex((track) =>
            selectedTracks.has(track.id),
          );
          e.preventDefault();
          onDown(lastSelectedTrackID, tracks, e.shiftKey);
          break;
        }

        case 'Enter':
          e.preventDefault();
          await onEnter(firstSelectedTrackID, tracks);
          break;

        default:
          break;
      }
    },
    [onControlAll, onDown, onUp, onEnter, selectedTracks, tracks],
  );

  /**
   * Playlists re-order events handlers
   */
  const onReorderStart = useCallback(
    () => setReorderedTracks(selectedTracks),
    [selectedTracks],
  );
  const onReorderEnd = useCallback(() => setReorderedTracks(null), []);

  const onDrop = useCallback(
    async (targetTrackID: string, position: 'above' | 'below') => {
      if (onReorder && currentPlaylist && reorderedTracks) {
        onReorder(currentPlaylist, reorderedTracks, targetTrackID, position);
      }
    },
    [currentPlaylist, onReorder, reorderedTracks],
  );

  /**
   * Tracks selection
   */
  const selectTrack = useCallback(
    (event: React.MouseEvent, trackID: string) => {
      // To allow selection drag-and-drop, we need to prevent track selection
      // when selection a track that is already selected
      if (
        selectedTracks.has(trackID) &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey
      ) {
        return;
      }

      setSelectedTracks(keyboardSelect(tracks, selectedTracks, trackID, event));
    },
    [tracks, selectedTracks],
  );

  const selectTrackClick = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent, trackID: string) => {
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        selectedTracks.has(trackID)
      ) {
        setSelectedTracks(new Set([trackID]));
      }
    },
    [selectedTracks],
  );

  /**
   * Context menus
   */
  const showContextMenu = useCallback(
    async (e: React.MouseEvent, index: number) => {
      e.preventDefault();

      const selectedCount = selectedTracks.size;
      const track = tracks[index];
      let shownPlaylists = playlists;

      // Hide current playlist if one the given playlist view
      if (type === 'playlist') {
        shownPlaylists = playlists.filter(
          (elem) => elem.id !== currentPlaylist,
        );
      }

      // Playlist sub-menu
      const playlistSubMenu = await Promise.all([
        MenuItem.new({
          text: 'Create new playlist...',
          async action() {
            await PlaylistsAPI.create(
              'New playlist',
              Array.from(selectedTracks),
            );
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
                  await PlaylistsAPI.addTracks(
                    playlist.id,
                    Array.from(selectedTracks),
                  );
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
            playerAPI.addInQueue(Array.from(selectedTracks));
          },
        }),
        MenuItem.new({
          text: 'Play next',
          action() {
            playerAPI.addNextInQueue(Array.from(selectedTracks));
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
                await PlaylistsAPI.removeTracks(
                  currentPlaylist,
                  Array.from(selectedTracks),
                );
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
              navigate(`/details/${track.id}`);
            },
          }),
          PredefinedMenuItem.new({ item: 'Separator' }),
          MenuItem.new({
            text: 'Show in file manager',
            action: async () => {
              await revealItemInDir(track.path);
            },
          }),
          MenuItem.new({
            text: 'Remove from library',
            action: async () => {
              await libraryAPI.remove(Array.from(selectedTracks));
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
      selectedTracks,
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
                selected={selectedTracks.has(track.id)}
                track={track}
                isPlaying={trackPlayingID === track.id}
                index={virtualItem.index}
                onMouseDown={selectTrack}
                onClick={selectTrackClick}
                onContextMenu={showContextMenu}
                onDoubleClick={startPlayback}
                draggable={reorderable}
                reordered={reorderedTracks?.has(track.id) || false}
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

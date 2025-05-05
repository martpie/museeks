import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';

import type { Config, Playlist, Track } from '../generated/typings';
import { logAndNotifyError } from '../lib/utils';
import { isKeyWithoutModifiers } from '../lib/utils-events';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { usePlayerAPI } from '../stores/usePlayerStore';
import TrackRow from './TrackRow';
import TracksListHeader from './TracksListHeader';

import { useNavigate, useSearch } from '@tanstack/react-router';
import useDndSensors from '../hooks/useDnDSensors';
import useInvalidate from '../hooks/useInvalidate';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import {
  getScrollPosition,
  saveScrollPosition,
} from '../lib/scroll-restoration';
import { listKeyboardSelect, listMouseSelect } from '../lib/utils-list';
import styles from './TracksList.module.css';

const ROW_HEIGHT = 30;
const ROW_HEIGHT_COMPACT = 24;
const DND_MODIFIERS = [restrictToVerticalAxis];

// --------------------------------------------------------------------------
// TrackList
// --------------------------------------------------------------------------

type CommonProps = {
  tracks: Track[];
  isSortEnabled: boolean;
  reorderable?: boolean;
  onReorder?: (tracks: Track[]) => void;
};

type Props = CommonProps & {
  layout: 'default';
  tracksDensity: Config['track_view_density'];
  playlists: Playlist[];
  currentPlaylist?: string;
  // For View-specific context menus
  extraContextMenu?: Array<{
    label: string;
    action: (selectedTrackIDs: Set<string>) => void;
  }>;
};

export default function TracksList(props: Props) {
  const {
    tracks,
    isSortEnabled,
    tracksDensity,
    reorderable,
    currentPlaylist,
    onReorder,
    playlists,
    extraContextMenu,
  } = props;

  const trackPlayingID = usePlayingTrackID();
  const playerAPI = usePlayerAPI();
  const libraryAPI = useLibraryAPI();

  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const searchParams = useSearch({ from: '__root__' });
  const shouldJumpToPlayingTrack = searchParams.jump_to_playing_track === true;

  // Scrollable element for the virtual list + virtualizer
  // TODO: should be colocated with the child component
  const scrollableRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tracks.length,
    initialOffset: getScrollPosition(),
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

  // Persist scroll position
  useEffect(() => {
    const target = scrollableRef.current;

    function onSaveScrollPosition() {
      if (target?.scrollTop != null) {
        saveScrollPosition(target.scrollTop);
      }
    }

    target?.addEventListener('scroll', onSaveScrollPosition);

    return function cleanup() {
      target?.removeEventListener('scroll', onSaveScrollPosition);
    };
  }, []);

  // Highlight playing track and scroll to it
  useEffect(() => {
    if (shouldJumpToPlayingTrack && trackPlayingID) {
      navigate({ to: '.', search: { jump_to_playing_track: false } });
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
    trackPlayingID,
    navigate,
    tracks,
    virtualizer.scrollToIndex,
  ]);

  /**
   * Helpers
   */
  const onPlaybackStart = useCallback(
    async (trackID: string) => {
      playerAPI.start(tracks, trackID);
    },
    [tracks, playerAPI],
  );

  /**
   * Keyboard navigations events/helpers
   */
  const onKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const firstSelectedTrackIndex = tracks.findIndex((track) =>
        selectedTracks.has(track.id),
      );

      if (event.key === 'Enter') {
        event.preventDefault();
        // Start playback at first select track location
        if (firstSelectedTrackIndex !== -1) {
          playerAPI.start(tracks, tracks[firstSelectedTrackIndex].id);
        }
      }

      // Handle cmd+A, arrow up and down
      const [newSelection, scrollIndex] = listKeyboardSelect(
        tracks,
        selectedTracks,
        event,
      );

      setSelectedTracks(newSelection);
      if (scrollIndex != null) {
        virtualizer.scrollToIndex(scrollIndex);
      }
    },
    [selectedTracks, tracks, playerAPI, virtualizer],
  );

  /**
   * Tracks selection
   */
  const onTrackSelect = useCallback(
    (event: React.MouseEvent, trackID: string) => {
      // To allow selection drag-and-drop, we need to prevent track selection
      // when selection a track that is already selected
      if (isKeyWithoutModifiers(event) && selectedTracks.has(trackID)) {
        return;
      }

      setSelectedTracks(
        listMouseSelect(tracks, selectedTracks, trackID, event),
      );
    },
    [tracks, selectedTracks],
  );

  /**
   * Context menus
   */
  const onContextMenu = useCallback(
    async (event: React.MouseEvent, index: number) => {
      event.preventDefault();

      const selectedCount = selectedTracks.size;
      const track = tracks[index];

      // Hide current playlist if one the given playlist view
      const shownPlaylists = playlists.filter(
        (elem) => elem.id !== currentPlaylist,
      );

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

      const menuItemsBuilder = [
        // Tracks Selected indicator
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
        // Queue Management
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
        // Playlist Management -> to be moved elsewhere
        Submenu.new({
          text: 'Add to playlist',
          items: playlistSubMenu,
        }),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
        // Quick-search
        ...track.artists.map((artist) =>
          MenuItem.new({
            text: `Search for "${artist}" `,
            action: () => {
              libraryAPI.search(artist);
            },
          }),
        ),
        MenuItem.new({
          text: `Search for "${track.album}"`,
          action() {
            libraryAPI.search(track.album);
          },
        }),
      ];

      if (extraContextMenu != null) {
        menuItemsBuilder.push(
          PredefinedMenuItem.new({ item: 'Separator' }),
          ...extraContextMenu.map((item) =>
            MenuItem.new({
              text: item.label,
              action: () => item.action(selectedTracks),
            }),
          ),
        );
      }

      menuItemsBuilder.push(
        ...[
          PredefinedMenuItem.new({ item: 'Separator' }),
          MenuItem.new({
            text: 'Edit track',
            action: () => {
              navigate({ to: `/tracks/${track.id}` });
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
        ],
      );

      const menu = await Menu.new({
        items: await Promise.all(menuItemsBuilder),
      });

      await menu.popup().catch(logAndNotifyError);
    },
    [
      currentPlaylist,
      playlists,
      selectedTracks,
      tracks,
      navigate,
      playerAPI,
      libraryAPI,
      invalidate,
      extraContextMenu,
    ],
  );

  return (
    <div className={styles.tracksList}>
      <Keybinding onKey={onKeyEvent} preventInputConflict />
      <TrackListDefault
        tracks={tracks}
        selectedTracks={selectedTracks}
        virtualizer={virtualizer}
        scrollableRef={scrollableRef}
        isSortEnabled={isSortEnabled}
        reorderable={reorderable}
        onReorder={onReorder}
        onTrackSelect={onTrackSelect}
        onContextMenu={onContextMenu}
        onPlaybackStart={onPlaybackStart}
      />
    </div>
  );
}

/** ----------------------------------------------------------------------------
 * List-based layout for TracksList:
 *  - Uses a Virtual List
 *  - Reorderable if needed (for playlists)
 * -------------------------------------------------------------------------- */
type DefaultListProps = CommonProps & {
  selectedTracks: Set<string>;
  scrollableRef: React.RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  onTrackSelect: (event: React.MouseEvent, trackID: string) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => Promise<void>;
  onPlaybackStart: (trackID: string) => Promise<void>;
};

function TrackListDefault(props: DefaultListProps) {
  const {
    tracks,
    scrollableRef,
    virtualizer,
    isSortEnabled,
    reorderable,
    selectedTracks,
    onReorder,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;

  const trackPlayingID = usePlayingTrackID();

  /**
   * Playlist tracks re-order events handlers
   */
  const sensors = useDndSensors();

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {
        active, // dragged item
        over, // on which item it was dropped
      } = event;

      // The item was dropped either nowhere, or on the same item
      if (over == null || active.id === over.id || !onReorder) {
        return;
      }

      const activeIndex = tracks.findIndex((track) => track.id === active.id);
      const overIndex = tracks.findIndex((track) => track.id === over.id);

      const newTracks = [...tracks];

      const movedTrack = newTracks.splice(activeIndex, 1)[0]; // Remove active track
      newTracks.splice(overIndex, 0, movedTrack); // Move it to where the user dropped it

      onReorder(newTracks);
    },
    [onReorder, tracks],
  );

  return (
    <DndContext
      onDragEnd={onDragEnd}
      id="dnd-playlist"
      modifiers={DND_MODIFIERS}
      sensors={sensors}
    >
      <div ref={scrollableRef} className={styles.tracksListScroller}>
        <TracksListHeader enableSort={isSortEnabled} />

        {/* The large inner element to hold all of the items */}
        <div
          className={styles.tracksListRows}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <SortableContext
            items={tracks}
            strategy={verticalListSortingStrategy}
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
                  onMouseDown={onTrackSelect}
                  onContextMenu={onContextMenu}
                  onDoubleClick={onPlaybackStart}
                  draggable={reorderable}
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
                    zIndex: 1,
                  }}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}

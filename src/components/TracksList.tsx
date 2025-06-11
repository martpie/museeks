import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';

import type { Config, Playlist, Track, TrackGroup } from '../generated/typings';
import { logAndNotifyError } from '../lib/utils';
import { isKeyWithoutModifiers } from '../lib/utils-events';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { usePlayerAPI } from '../stores/usePlayerStore';

import { useNavigate, useSearch } from '@tanstack/react-router';
import useInvalidate from '../hooks/useInvalidate';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import {
  getScrollPosition,
  saveScrollPosition,
} from '../lib/scroll-restoration';
import { listKeyboardSelect, listMouseSelect } from '../lib/utils-list';
import type { QueueOrigin, TracksListVirtualizer } from '../types/museeks';
import TracksListDefault from './TracksListDefault';
import TracksListGrouped from './TracksListGrouped';

import styles from './TracksList.module.css';

// --------------------------------------------------------------------------
// TrackList
// --------------------------------------------------------------------------

type TracksListProps = {
  playlists: Playlist[];
  tracksDensity: Config['track_view_density'];
  isSortEnabled: boolean;
  reorderable?: boolean;
  onReorder?: (tracks: Track[]) => void;
  queueOrigin: QueueOrigin;
  // For View-specific context menus
  extraContextMenu?: Array<{
    label: string;
    action: (selectedTrackIDs: Set<string>) => void;
  }>;
};

interface TrackListDefaultLayoutProps extends TracksListProps {
  layout: 'default';
  data: Array<Track>;
}

interface TrackListGroupedLayoutProps extends TracksListProps {
  layout: 'grouped';
  data: Array<TrackGroup>;
}

type Props = TrackListDefaultLayoutProps | TrackListGroupedLayoutProps;

const ROW_HEIGHT = 30;
const ROW_HEIGHT_COMPACT = 24;

export default function TracksList(props: Props) {
  const {
    layout,
    data,
    isSortEnabled,
    tracksDensity,
    reorderable,
    queueOrigin,
    onReorder,
    playlists,
    extraContextMenu,
  } = props;

  // We need to flatten the list of tracks for some operations
  const tracks: Array<Track> = useMemo(() => {
    if (layout === 'default') {
      return data;
    }

    return data.flatMap((group) => group.tracks);
  }, [data, layout]);

  const trackPlayingID = usePlayingTrackID();
  const playerAPI = usePlayerAPI();
  const libraryAPI = useLibraryAPI();
  const { t } = useLingui();

  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const searchParams = useSearch({ from: '__root__' });
  const shouldJumpToPlayingTrack = searchParams.jump_to_playing_track === true;

  // Scrollable element for the virtual list + virtualizer
  // TODO: should be colocated with the child component
  const scrollableRef = useRef<TracksListVirtualizer>(null);
  const virtualizer = scrollableRef.current;

  // Persist scroll position
  useEffect(() => {
    const target = virtualizer?.scrollElement;

    function onSaveScrollPosition() {
      if (target?.scrollTop != null) {
        saveScrollPosition(target.scrollTop);
      }
    }

    target?.addEventListener('scroll', onSaveScrollPosition);

    return function cleanup() {
      target?.removeEventListener('scroll', onSaveScrollPosition);
    };
  }, [virtualizer]);

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
          virtualizer?.scrollToIndex(playingTrackIndex, { behavior: 'smooth' });
        }, 0);
      }
    }
  }, [
    shouldJumpToPlayingTrack,
    trackPlayingID,
    navigate,
    tracks,
    virtualizer?.scrollToIndex,
  ]);

  /**
   * Helpers
   */
  const onPlaybackStart = useCallback(
    async (trackID: string) => {
      playerAPI.start(tracks, trackID, queueOrigin);
    },
    [tracks, playerAPI, queueOrigin],
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
          onPlaybackStart(tracks[firstSelectedTrackIndex].id);
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
        virtualizer?.scrollToIndex(scrollIndex);
      }
    },
    [selectedTracks, tracks, virtualizer, onPlaybackStart],
  );

  /**
   * Tracks selection
   */
  const onTrackSelect = useCallback(
    (event: React.MouseEvent, trackID: string, _trackIndex: number) => {
      // There can be a race condition between mousedown and click, where mousedown
      // will remove an item from the selection (with ctrl) for example, but then
      // the mouseup part of click will re-toggle the selection immediately.
      // Ideally, all of below should be within `listMouseSelect`
      if (event.type === 'click') {
        if (isKeyWithoutModifiers(event)) {
          setSelectedTracks(new Set([trackID]));
        }
        return;
      }

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
    async (event: React.MouseEvent, _trackID: string, index: number) => {
      event.preventDefault();

      const selectedCount = selectedTracks.size;
      const track = tracks[index];
      const currentPlaylistID =
        queueOrigin.type === 'playlist' ? queueOrigin.playlistID : null;

      // Hide current playlist if one the given playlist view
      const shownPlaylists = playlists.filter(
        (elem) => elem.id !== currentPlaylistID,
      );

      // Playlist sub-menu
      const playlistSubMenu = await Promise.all([
        MenuItem.new({
          text: t`Create new playlist...`,
          async action() {
            await PlaylistsAPI.create(
              t`New playlist`,
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
          await MenuItem.new({ text: t`No playlists`, enabled: false }),
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
          text: plural(selectedCount, {
            one: `${selectedCount} track selected`,
            other: `${selectedCount} tracks selected`,
          }),
          enabled: false,
        }),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
        // Queue Management
        MenuItem.new({
          text: t`Add to queue`,
          action() {
            playerAPI.addInQueue(Array.from(selectedTracks));
          },
        }),
        MenuItem.new({
          text: t`Play next`,
          action() {
            playerAPI.addNextInQueue(Array.from(selectedTracks));
          },
        }),
        PredefinedMenuItem.new({
          item: 'Separator',
        }),
        // Playlist Management -> to be moved elsewhere
        Submenu.new({
          text: t`Add to playlist`,
          items: playlistSubMenu,
        }),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
        // Quick-search
        ...track.artists.map((artist) =>
          MenuItem.new({
            text: t`Search for "${artist}" `,
            action: () => {
              libraryAPI.search(artist);
            },
          }),
        ),
        MenuItem.new({
          text: t`Search for "${track.album}"`,
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
            text: t`Edit track`,
            action: () => {
              navigate({
                to: '/tracks/$trackID',
                params: { trackID: track.id },
              });
            },
          }),
          PredefinedMenuItem.new({ item: 'Separator' }),
          MenuItem.new({
            text: t`Show in file manager`,
            action: async () => {
              await revealItemInDir(track.path);
            },
          }),
          MenuItem.new({
            text: t`Remove from library`,
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
      queueOrigin,
      playlists,
      selectedTracks,
      tracks,
      navigate,
      playerAPI,
      libraryAPI,
      invalidate,
      extraContextMenu,
      t,
    ],
  );

  const rowHeight =
    tracksDensity === 'compact' ? ROW_HEIGHT_COMPACT : ROW_HEIGHT;

  return (
    <div className={styles.tracksList} data-museeks-list>
      <Keybinding onKey={onKeyEvent} preventInputConflict />
      {layout === 'default' && (
        <TracksListDefault
          ref={scrollableRef}
          tracks={data}
          rowHeight={rowHeight}
          selectedTracks={selectedTracks}
          isSortEnabled={isSortEnabled}
          reorderable={reorderable}
          initialOffset={getScrollPosition()}
          onReorder={onReorder}
          onTrackSelect={onTrackSelect}
          onContextMenu={onContextMenu}
          onPlaybackStart={onPlaybackStart}
        />
      )}
      {layout === 'grouped' && (
        <TracksListGrouped
          ref={scrollableRef}
          trackGroups={data}
          rowHeight={rowHeight}
          selectedTracks={selectedTracks}
          initialOffset={getScrollPosition()}
          onTrackSelect={onTrackSelect}
          onContextMenu={onContextMenu}
          onPlaybackStart={onPlaybackStart}
        />
      )}
    </div>
  );
}

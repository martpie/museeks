import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { ask } from '@tauri-apps/plugin-dialog';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';

import type { Config, Playlist, Track, TrackGroup } from '../generated/typings';
import useInvalidate from '../hooks/useInvalidate';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import BridgeDatabase from '../lib/bridge-database';
import player from '../lib/player';
import {
  getScrollPosition,
  saveScrollPosition,
} from '../lib/scroll-restoration';
import { logAndNotifyError } from '../lib/utils';
import { isKeyWithoutModifiers } from '../lib/utils-events';
import { listKeyboardSelect, listMouseSelect } from '../lib/utils-list';
import PlaylistsAPI from '../stores/PlaylistsAPI';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { useToastsAPI } from '../stores/useToastsStore';
import type { QueueOrigin, TrackListVirtualizer } from '../types/museeks';
import styles from './TrackList.module.css';
import TrackListDefault from './TrackListDefault';
import TrackListGrouped from './TrackListGrouped';

// --------------------------------------------------------------------------
// TrackList
// --------------------------------------------------------------------------

type TrackListProps = {
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

interface TrackListDefaultLayoutProps extends TrackListProps {
  layout: 'default';
  data: Array<Track>;
}

interface TrackListGroupedLayoutProps extends TrackListProps {
  layout: 'grouped';
  data: Array<TrackGroup>;
}

type Props = TrackListDefaultLayoutProps | TrackListGroupedLayoutProps;

const ROW_HEIGHT = 30;
const ROW_HEIGHT_COMPACT = 24;

export default function TrackList(props: Props) {
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
  const libraryAPI = useLibraryAPI();
  const toastsAPI = useToastsAPI();
  const { t } = useLingui();

  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const searchParams = useSearch({ from: '__root__' });
  const shouldJumpToPlayingTrack = searchParams.jump_to_playing_track === true;

  // Scrollable element for the virtual list + virtualizer
  // TODO: should be colocated with the child component
  const scrollableRef = useRef<TrackListVirtualizer>(null);
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
      player.start(tracks, trackID, queueOrigin);
    },
    [tracks, queueOrigin],
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
      const playlistSubMenuItems = [
        MenuItem.new({
          text: t`Create new playlist...`,
          async action() {
            await PlaylistsAPI.create(
              t`New playlist`,
              Array.from(selectedTracks),
            );
            await invalidate();
          },
        }),
        PredefinedMenuItem.new({
          item: 'Separator',
        }),
      ];

      if (shownPlaylists.length === 0) {
        playlistSubMenuItems.push(
          MenuItem.new({ text: t`No playlists`, enabled: false }),
        );
      } else {
        playlistSubMenuItems.push(
          ...shownPlaylists.map((playlist) =>
            MenuItem.new({
              text: playlist.name,
              async action() {
                await PlaylistsAPI.addTracks(
                  playlist.id,
                  Array.from(selectedTracks),
                );

                toastsAPI.add(
                  'success',
                  t`${selectedTracks.size} track(s) were added to "${playlist.name}"`,
                );
              },
            }),
          ),
        );
      }

      const playlistSubMenu = await Promise.all(playlistSubMenuItems);
      const artistsAndAlbum = [...new Set([...track.artists, track.album])];
      const artistsAndAlbumAndTitle = [
        ...new Set([track.title, ...artistsAndAlbum]),
      ];

      const menuItemsBuilder = [
        // Tracks Selected indicator
        MenuItem.new({
          text: plural(selectedCount, {
            one: '# track selected',
            other: '# tracks selected',
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
          async action() {
            player.addToQueue(
              await BridgeDatabase.getTracks(Array.from(selectedTracks)),
            );
          },
        }),
        MenuItem.new({
          text: t`Play next`,
          async action() {
            player.addNextInQueue(
              await BridgeDatabase.getTracks(Array.from(selectedTracks)),
            );
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
        ...artistsAndAlbum.map((item) =>
          MenuItem.new({
            text: t`Search for "${item}"`,
            action: () => {
              libraryAPI.search(item);
            },
          }),
        ),
        PredefinedMenuItem.new({
          text: '?',
          item: 'Separator',
        }),
        // Copy
        ...artistsAndAlbumAndTitle.map((item) =>
          MenuItem.new({
            text: t`Copy "${item}"`,
            action: () => {
              writeText(item).catch(logAndNotifyError);
            },
          }),
        ),
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
              const confirm = await ask(
                t`Are you sure you want to remove ${selectedTracks.size} track(s) from your library?`,
                {
                  title: t`Remove tracks`,
                  kind: 'warning',
                  cancelLabel: t`Cancel`,
                  okLabel: t`Remove`,
                },
              );

              if (confirm) {
                await libraryAPI.remove(Array.from(selectedTracks));
                await invalidate();
              }
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
      libraryAPI,
      toastsAPI,
      invalidate,
      extraContextMenu,
      t,
    ],
  );

  const rowHeight =
    tracksDensity === 'compact' ? ROW_HEIGHT_COMPACT : ROW_HEIGHT;

  return (
    <div
      className={styles.trackList}
      data-museeks-list
      data-testid="track-list"
    >
      <Keybinding onKey={onKeyEvent} preventInputConflict />
      {layout === 'default' && (
        <TrackListDefault
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
        <TrackListGrouped
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

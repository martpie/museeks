import electron from 'electron';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import KeyBinding from 'react-keybinding-component';
import chunk from 'lodash-es/chunk';
import { useSelector } from 'react-redux';

import TrackRow from '../TrackRow/TrackRow';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';
import TracksListHeader from '../TracksListHeader/TracksListHeader';

import * as LibraryActions from '../../store/actions/LibraryActions';
import * as PlaylistsActions from '../../store/actions/PlaylistsActions';
import * as PlayerActions from '../../store/actions/PlayerActions';
import * as QueueActions from '../../store/actions/QueueActions';

import { isLeftClick, isRightClick } from '../../lib/utils-events';
import { isCtrlKey, isAltKey } from '../../lib/utils-platform';
import { PlaylistModel, TrackModel, PlayerStatus } from '../../../shared/types/museeks';
import { RootState } from '../../store/reducers';

import scrollbarStyles from '../CustomScrollbar/CustomScrollbar.module.css';
import headerStyles from '../Header/Header.module.css';
import styles from './TracksList.module.css';

const { shell, remote } = electron;
const { Menu } = remote;

const CHUNK_LENGTH = 20;
const ROW_HEIGHT = 30; // FIXME
const TILES_TO_DISPLAY = 5;
const TILE_HEIGHT = ROW_HEIGHT * CHUNK_LENGTH;

// --------------------------------------------------------------------------
// TrackList
// --------------------------------------------------------------------------

interface Props {
  type: string;
  playerStatus: string;
  tracks: TrackModel[];
  trackPlayingId: string | null;
  playlists: PlaylistModel[];
  currentPlaylist?: string;
  reorderable?: boolean;
  onReorder?: (playlistId: string, tracksIds: string[], targetTrackId: string, position: 'above' | 'below') => void;
}

const TracksList: React.FC<Props> = (props) => {
  const { tracks, type, trackPlayingId, reorderable, currentPlaylist, onReorder, playerStatus, playlists } = props;

  const [tilesScrolled, setTilesScrolled] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [reordered, setReordered] = useState<string[] | null>([]);
  const [renderView, setRenderView] = useState<HTMLElement | null>(null);

  const highlight = useSelector<RootState, boolean>((state) => state.library.highlightPlayingTrack);

  // Highlight playing track and scroll to it
  useEffect(() => {
    if (highlight === true && trackPlayingId && renderView) {
      setSelected([trackPlayingId]);

      const playingTrackIndex = tracks.findIndex((track) => track._id === trackPlayingId);

      if (playingTrackIndex >= 0) {
        const nodeOffsetTop = playingTrackIndex * ROW_HEIGHT;

        renderView.scrollTop = nodeOffsetTop;
      }

      LibraryActions.highlightPlayingTrack(false);
    }
  }, [highlight, trackPlayingId, renderView, tracks]);

  // FIXME: find a way to use a real ref for the render view
  useEffect(() => {
    const element = document.querySelector(`.${scrollbarStyles.renderView}`);

    if (element instanceof HTMLElement) setRenderView(element);
  }, []);

  /**
   * Helpers
   */

  const startPlayback = useCallback(
    async (_id: string) => {
      PlayerActions.start(tracks, _id);
    },
    [tracks]
  );

  /**
   * Keyboard navigations events/helpers
   */
  const onEnter = useCallback(async (i: number, tracks: TrackModel[]) => {
    if (i !== -1) PlayerActions.start(tracks, tracks[i]._id);
  }, []);

  const onControlAll = useCallback(
    (i: number, tracks: TrackModel[]) => {
      setSelected(tracks.map((track) => track._id));
      const nodeOffsetTop = (i - 1) * ROW_HEIGHT;

      if (renderView && renderView.scrollTop > nodeOffsetTop) renderView.scrollTop = nodeOffsetTop;
    },
    [renderView]
  );

  const onUp = useCallback(
    (i: number, tracks: TrackModel[], shiftKeyPressed: boolean) => {
      if (i - 1 >= 0) {
        // Issue #489, shift key modifier
        let newSelected = selected;

        if (shiftKeyPressed) newSelected = [tracks[i - 1]._id, ...selected];
        else newSelected = [tracks[i - 1]._id];

        setSelected(newSelected);
        const nodeOffsetTop = (i - 1) * ROW_HEIGHT;
        if (renderView && renderView.scrollTop > nodeOffsetTop) renderView.scrollTop = nodeOffsetTop;
      }
    },
    [renderView, selected]
  );

  const onDown = useCallback(
    (i: number, tracks: TrackModel[], shiftKeyPressed: boolean) => {
      if (i + 1 < tracks.length) {
        // Issue #489, shift key modifier
        let newSelected = selected;
        if (shiftKeyPressed) newSelected.push(tracks[i + 1]._id);
        else newSelected = [tracks[i + 1]._id];

        setSelected(newSelected);
        const nodeOffsetTop = (i + 1) * ROW_HEIGHT;

        if (renderView && renderView.scrollTop + renderView.offsetHeight <= nodeOffsetTop + ROW_HEIGHT) {
          renderView.scrollTop = nodeOffsetTop - renderView.offsetHeight + ROW_HEIGHT;
        }
      }
    },
    [renderView, selected]
  );

  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      let firstSelectedTrackId = tracks.findIndex((track) => selected.includes(track._id));

      switch (e.code) {
        case 'KeyA':
          if (isCtrlKey(e)) {
            onControlAll(firstSelectedTrackId, tracks);
            e.preventDefault();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          onUp(firstSelectedTrackId, tracks, e.shiftKey);
          break;

        case 'ArrowDown':
          // This effectively becomes lastSelectedTrackID
          firstSelectedTrackId = tracks.findIndex((track) => selected[selected.length - 1] === track._id);
          e.preventDefault();
          onDown(firstSelectedTrackId, tracks, e.shiftKey);
          break;

        case 'Enter':
          e.preventDefault();
          await onEnter(firstSelectedTrackId, tracks);
          break;

        default:
          break;
      }
    },
    [onControlAll, onDown, onUp, onEnter, selected, tracks]
  );

  /**
   * Playlists re-order events handlers
   */
  const onReorderStart = useCallback(() => setReordered(selected), [selected]);
  const onReorderEnd = useCallback(() => setReordered(null), []);

  const onDrop = useCallback(
    async (targetTrackId: string, position: 'above' | 'below') => {
      if (onReorder && currentPlaylist && reordered) {
        onReorder(currentPlaylist, reordered, targetTrackId, position);
      }
    },
    [currentPlaylist, onReorder, reordered]
  );

  /**
   * Tracks selection
   */
  const isSelectableTrack = useCallback((id: string) => !selected.includes(id), [selected]);

  const sortSelected = useCallback(
    (a: string, b: string): number => {
      const allTracksIds = tracks.map((track) => track._id);

      return allTracksIds.indexOf(a) - allTracksIds.indexOf(b);
    },
    [tracks]
  );

  const toggleSelectionById = useCallback(
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
    [selected, sortSelected]
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
    [selected, sortSelected, tracks]
  );

  const selectTrack = useCallback(
    (event: React.MouseEvent, trackId: string, index: number) => {
      // To allow selection drag-and-drop, we need to prevent track selection
      // when selection a track that is already selected
      if (selected.includes(trackId) && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        return;
      }

      if (isLeftClick(event) || (isRightClick(event) && isSelectableTrack(trackId))) {
        if (isCtrlKey(event)) {
          toggleSelectionById(trackId);
        } else if (event.shiftKey) {
          if (selected.length === 0) {
            const newSelected = [trackId];
            setSelected(newSelected);
          } else {
            multiSelect(index);
          }
        } else {
          if (!isAltKey(event)) {
            const newSelected = [trackId];
            setSelected(newSelected);
          }
        }
      }
    },
    [selected, multiSelect, toggleSelectionById, isSelectableTrack]
  );

  const selectTrackClick = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent, trackId: string) => {
      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && selected.includes(trackId)) {
        setSelected([trackId]);
      }
    },
    [selected]
  );

  /**
   * Context menus
   */
  const showContextMenu = useCallback(
    (_e: React.MouseEvent, index: number) => {
      const selectedCount = selected.length;
      const track = tracks[index];
      let shownPlaylists = playlists;

      // Hide current playlist if needed
      if (type === 'playlist') {
        shownPlaylists = playlists.filter((elem) => elem._id !== currentPlaylist);
      }

      const playlistTemplate: electron.MenuItemConstructorOptions[] = [];
      let addToQueueTemplate: electron.MenuItemConstructorOptions[] = [];

      if (shownPlaylists) {
        playlistTemplate.push(
          {
            label: 'Create new playlist...',
            click: async () => {
              await PlaylistsActions.create('New playlist', selected);
            },
          },
          {
            type: 'separator',
          }
        );

        if (shownPlaylists.length === 0) {
          playlistTemplate.push({
            label: 'No playlists',
            enabled: false,
          });
        } else {
          shownPlaylists.forEach((playlist) => {
            playlistTemplate.push({
              label: playlist.name,
              click: async () => {
                await PlaylistsActions.addTracks(playlist._id, selected);
              },
            });
          });
        }
      }

      if (playerStatus !== PlayerStatus.STOP) {
        addToQueueTemplate = [
          {
            label: 'Add to queue',
            click: async () => {
              await QueueActions.addAfter(selected);
            },
          },
          {
            label: 'Play next',
            click: async () => {
              await QueueActions.addNext(selected);
            },
          },
          {
            type: 'separator',
          },
        ];
      }

      const template: electron.MenuItemConstructorOptions[] = [
        {
          label: selectedCount > 1 ? `${selectedCount} tracks selected` : `${selectedCount} track selected`,
          enabled: false,
        },
        {
          type: 'separator',
        },
        ...addToQueueTemplate,
        {
          label: 'Add to playlist',
          submenu: playlistTemplate,
        },
        {
          type: 'separator',
      }]

      for (let artist of track.artist) {
        template.push({
          label: `Search for "${artist}" `,
          click: () => {
            // HACK
            const searchInput: HTMLInputElement | null = document.querySelector(
              `input[type="text"].${headerStyles.header__search__input}`
            );

            if (searchInput) {
              searchInput.value = track.artist[0];
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          },
        })
      }

      template.push({
          label: `Search for "${track.album}"`,
          click: () => {
            // HACK
            const searchInput: HTMLInputElement | null = document.querySelector(
              `input[type="text"].${headerStyles.header__search__input}`
            );

            if (searchInput) {
              searchInput.value = track.album;
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          },
      })

      if (type === 'playlist' && currentPlaylist) {
        template.push(
          {
            type: 'separator',
          },
          {
            label: 'Remove from playlist',
            click: async () => {
              await PlaylistsActions.removeTracks(currentPlaylist, selected);
            },
          }
        );
      }

      template.push(
        {
          type: 'separator',
        },
        {
          label: 'Show in file manager',
          click: () => {
            shell.showItemInFolder(track.path);
          },
        },
        {
          label: 'Remove from library',
          click: () => {
            LibraryActions.remove(selected);
          },
        }
      );

      const context = Menu.buildFromTemplate(template);

      context.popup({}); // Let it appear
    },
    [currentPlaylist, playerStatus, playlists, selected, tracks, type]
  );

  /**
   * Tracks list virtualization + rendering
   */

  const onScroll = useCallback(() => {
    if (renderView) {
      const nextTilesScrolled = Math.floor(renderView.scrollTop / TILE_HEIGHT);

      if (tilesScrolled !== nextTilesScrolled) {
        setTilesScrolled(nextTilesScrolled);
      }
    }
  }, [tilesScrolled, renderView]);

  const trackTiles = useMemo(() => {
    const tracksChunked = chunk(tracks, CHUNK_LENGTH);

    return tracksChunked.splice(tilesScrolled, TILES_TO_DISPLAY).map((tracksChunk, indexChunk) => {
      const list = tracksChunk.map((track, index) => {
        const trackRowIndex = (tilesScrolled + indexChunk) * CHUNK_LENGTH + index;

        return (
          <TrackRow
            selected={selected.includes(track._id)}
            track={track}
            isPlaying={trackPlayingId === track._id}
            key={`track-${track._id}`}
            index={trackRowIndex}
            onMouseDown={selectTrack}
            onClick={selectTrackClick}
            onContextMenu={showContextMenu}
            onDoubleClick={startPlayback}
            draggable={reorderable}
            reordered={(reordered && reordered.includes(track._id)) || false}
            onDragStart={onReorderStart}
            onDragEnd={onReorderEnd}
            onDrop={onDrop}
          />
        );
      });

      const translationDistance = tilesScrolled * ROW_HEIGHT * CHUNK_LENGTH + indexChunk * ROW_HEIGHT * CHUNK_LENGTH;
      const tracksListTileStyles = {
        transform: `translate3d(0, ${translationDistance}px, 0)`,
      };

      return (
        <div className={styles.tile} key={`chunk-${tracksChunk[0]._id}`} style={tracksListTileStyles}>
          {list}
        </div>
      );
    });
  }, [
    reordered,
    selected,
    tilesScrolled,
    reorderable,
    trackPlayingId,
    tracks,
    onDrop,
    onReorderStart,
    onReorderEnd,
    selectTrack,
    selectTrackClick,
    showContextMenu,
    startPlayback,
  ]);

  return (
    <div className={styles.tracksList}>
      <KeyBinding onKey={onKey} preventInputConflict />
      <TracksListHeader enableSort={type === 'library'} />
      <CustomScrollbar className={styles.tracksListBody} onScroll={onScroll}>
        <div className={styles.tiles} role='listbox' style={{ height: tracks.length * ROW_HEIGHT }}>
          {trackTiles}
        </div>
      </CustomScrollbar>
    </div>
  );
};

export default TracksList;

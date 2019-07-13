 import * as electron from 'electron';
import * as React from 'react';
import KeyBinding from 'react-keybinding-component';
import chunk from 'lodash-es/chunk';

import TrackRow from '../TrackRow/TrackRow';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';
import TracksListHeader from '../TracksListHeader/TracksListHeader';

import * as LibraryActions from '../../actions/LibraryActions';
import * as PlaylistsActions from '../../actions/PlaylistsActions';
import * as PlayerActions from '../../actions/PlayerActions';
import * as QueueActions from '../../actions/QueueActions';

import { isCtrlKey, isAltKey } from '../../utils/utils-platform';
import { PlaylistModel, TrackModel, PlayerStatus } from '../../../shared/types/interfaces';

import * as styles from './TracksList.css';
import * as scrollbarStyles from '../CustomScrollbar/CustomScrollbar.css';

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
  onReorder?: (
    playlistId: string,
    tracksIds: string[],
    targetTrackId: string,
    position: 'above' | 'below'
  ) => void;
}

interface State {
  selected: string[];
  tilesScrolled: number;
  reordered: string[] | null; // TODO make it an array of strings (one day)
}

export default class TracksList extends React.Component<Props, State> {
  static defaultProps = {
    currentPlaylist: '',
    reorderable: false
  };

  static isLeftClick = (e: React.MouseEvent) => e.button === 0;
  static isRightClick = (e: React.MouseEvent) => e.button === 2;

  renderView: HTMLDivElement | null = null;

  constructor (props: Props) {
    super(props);
    this.state = {
      tilesScrolled: 0,
      selected: [],
      reordered: null
    };
  }

  componentDidMount () {
    this.renderView = document.querySelector(`.${scrollbarStyles.renderView}`);
  }

  onScroll = () => {
    if (this.renderView) {
      const tilesScrolled = Math.floor(this.renderView.scrollTop / TILE_HEIGHT);

      if (this.state.tilesScrolled !== tilesScrolled) {
        this.setState({ tilesScrolled });
      }
    }
  }

  onKey = async (e: KeyboardEvent) => {
    const { selected } = this.state;
    const { tracks } = this.props;

    let firstSelectedTrackId = tracks.findIndex(track => selected.includes(track._id));

    switch (e.code) {
      // CTRL+All selection
      case 'KeyA':
        if (e.ctrlKey) this.onControlAll(firstSelectedTrackId, tracks);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.onUp(firstSelectedTrackId, tracks, e.shiftKey);
        break;

      case 'ArrowDown':
        // This effectively becomes lastSelectedTrackID
        firstSelectedTrackId = tracks.findIndex(track => selected[selected.length - 1] === track._id);
        e.preventDefault();
        this.onDown(firstSelectedTrackId, tracks, e.shiftKey);
        break;

      case 'Enter':
        e.preventDefault();
        await this.onEnter(firstSelectedTrackId, tracks);
        break;
      default:
        break;
    }
  }

  onControlAll (i: number, tracks: TrackModel[]) {
    this.setState({ selected: tracks.map((track) => track._id) }, () => {
      const container = this.renderView;
      const nodeOffsetTop = (i - 1) * ROW_HEIGHT;

      if (container && container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
    });
  }

  onUp (i: number, tracks: TrackModel[], shiftKeyPressed: boolean) {
    if (i - 1 >= 0) {

      // Issue #489, shift key modifier
      let newSelected = this.state.selected;
      if (shiftKeyPressed) newSelected = [tracks[i - 1]._id, ...this.state.selected];
      else newSelected = [tracks[i - 1]._id];

      this.setState({ selected: newSelected }, () => {
        const container = this.renderView;
        const nodeOffsetTop = (i - 1) * ROW_HEIGHT;

        if (container && container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
      });
    }
  }

  onDown (i: number, tracks: TrackModel[], shiftKeyPressed: boolean) {
    if (i + 1 < tracks.length) {

      // Issue #489, shift key modifier
      let newSelected = this.state.selected;
      if (shiftKeyPressed) newSelected.push(tracks[i + 1]._id);
      else newSelected = [tracks[i + 1]._id];

      this.setState({ selected: newSelected }, () => {
        const container: HTMLDivElement | null = this.renderView;
        const nodeOffsetTop = (i + 1) * ROW_HEIGHT;

        if (container && container.scrollTop + container.offsetHeight <= nodeOffsetTop + ROW_HEIGHT) {
          container.scrollTop = (nodeOffsetTop - container.offsetHeight) + ROW_HEIGHT;
        }
      });
    }
  }

  onReorderStart = () => {
    this.setState({
      reordered: this.state.selected
    });
  }

  onReorderEnd = () => {
    this.setState({
      reordered: null
    });
  }

  onReorder = async (
    targetTrackId: string,
    position: 'above' | 'below'
  ) => {
    const { reordered } = this.state;
    const { onReorder, currentPlaylist } = this.props;

    if (onReorder && currentPlaylist && reordered) {
      onReorder(currentPlaylist, reordered, targetTrackId, position);
    }
  }

  async onEnter (i: number, tracks: TrackModel[]) {
    if (i !== -1) await PlayerActions.start(tracks, tracks[i]._id);
  }

  getTrackTiles () {
    const { selected, reordered, tilesScrolled } = this.state;
    const { trackPlayingId, tracks, reorderable } = this.props;

    const tracksChunked = chunk(tracks, CHUNK_LENGTH);

    return tracksChunked.splice(tilesScrolled, TILES_TO_DISPLAY).map((tracksChunk, indexChunk) => {
      const list = tracksChunk.map((track, index) => {
        const trackRowIndex = ((tilesScrolled + indexChunk) * CHUNK_LENGTH) + index;

        return (
          <TrackRow
            selected={selected.includes(track._id)}
            track={track}
            isPlaying={trackPlayingId === track._id}
            key={`track-${track._id}`}
            index={trackRowIndex}
            onMouseDown={this.selectTrack}
            onClick={this.selectTrackClick}
            onContextMenu={this.showContextMenu}
            onDoubleClick={this.startPlayback}
            draggable={reorderable}
            reordered={reordered && reordered.includes(track._id) || false}
            onDragStart={this.onReorderStart}
            onDragEnd={this.onReorderEnd}
            onDrop={this.onReorder}
          />
        );
      });

      const translationDistance = (tilesScrolled * ROW_HEIGHT * CHUNK_LENGTH) + (indexChunk * ROW_HEIGHT * CHUNK_LENGTH);
      const tracksListTileStyles = {
        transform: `translate3d(0, ${translationDistance}px, 0)`
      };

      return (
        <div
          className={styles.tile}
          key={`chunk-${tracksChunk[0]._id}`}
          style={tracksListTileStyles}
        >
          { list }
        </div>
      );
    });
  }

  isSelectableTrack (id: string) {
    return !this.state.selected.includes(id);
  }

  sortSelected = (a: string, b: string): number => {
    const allTracksIds = this.props.tracks.map(track => track._id);

    return allTracksIds.indexOf(a) - allTracksIds.indexOf(b);
  }

  selectTrack = (event: React.MouseEvent, trackId: string, index: number) => {
    // To allow selection drag-and-drop, we need to prevent track selection
    // when selection a track that is already selected
    if (this.state.selected.includes(trackId)
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
    ) {
      return;
    }

    if (TracksList.isLeftClick(event)
      || (TracksList.isRightClick(event) && this.isSelectableTrack(trackId))
    ) {
      if (isCtrlKey(event)) {
        this.toggleSelectionById(trackId);
      } else if (event.shiftKey) {
        if (this.state.selected.length === 0) {
          const selected = [trackId];
          this.setState({ selected });
        } else this.multiSelect(index);
      } else {
        if (!isAltKey(event)) {
          const selected = [trackId];
          this.setState({ selected });
        }
      }
    }
  }

  selectTrackClick = (event: React.MouseEvent, trackId: string) => {
    const { selected } = this.state;

    if (!event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && selected.includes(trackId)
    ) {
      this.setState({
        selected: [trackId]
      });
    }
  }

  toggleSelectionById (id: string) {
    let selected = [...this.state.selected];

    if (selected.includes(id)) {
      // remove track
      selected.splice(selected.indexOf(id), 1);
    } else {
      // add track
      selected.push(id);
    }

    selected = selected.sort(this.sortSelected);
    this.setState({ selected });
  }

  multiSelect (index: number) {
    const { tracks } = this.props;
    const { selected } = this.state;

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

    this.setState({ selected: newSelected.sort(this.sortSelected) });
  }

  showContextMenu = (_e: React.MouseEvent, index: number) => {
    const { type, playerStatus } = this.props;
    const { selected } = this.state;
    const selectedCount = selected.length;
    const track = this.props.tracks[index];

    let playlists = [...this.props.playlists];

    // Hide current playlist if needed
    if (this.props.type === 'playlist') {
      playlists = playlists.filter(elem => elem._id !== this.props.currentPlaylist);
    }

    const playlistTemplate: electron.MenuItemConstructorOptions[] = [];
    let addToQueueTemplate: electron.MenuItemConstructorOptions[] = [];

    if (playlists) {
      playlistTemplate.push(
        {
          label: 'Create new playlist...',
          click: async () => {
            const playlistId = await PlaylistsActions.create('New playlist');
            await PlaylistsActions.addTracks(playlistId, selected);
          }
        },
        {
          type: 'separator'
        }
      );

      if (playlists.length === 0) {
        playlistTemplate.push({
          label: 'No playlists',
          enabled: false
        });
      } else {
        playlists.forEach((playlist) => {
          playlistTemplate.push({
            label: playlist.name,
            click: async () => {
              await PlaylistsActions.addTracks(playlist._id, selected);
            }
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
          }
        },
        {
          label: 'Play next',
          click: async () => {
            await QueueActions.addNext(selected);
          }
        },
        {
          type: 'separator'
        }
      ];
    }

    const template: electron.MenuItemConstructorOptions[] = [
      {
        label: selectedCount > 1 ? `${selectedCount} tracks selected` : `${selectedCount} track selected`,
        enabled: false
      },
      {
        type: 'separator'
      },
      ...addToQueueTemplate,
      {
        label: 'Add to playlist',
        submenu: playlistTemplate
      },
      {
        type: 'separator'
      },
      {
        label: `Search for "${track.artist[0]}" `,
        click: () => {
          // HACK
          const searchInput: HTMLInputElement | null = document.querySelector('input[type="text"].search');

          if (searchInput) {
            searchInput.value = track.artist[0];
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      },
      {
        label: `Search for "${track.album}"`,
        click: () => {
          // HACK
          const searchInput: HTMLInputElement | null = document.querySelector('input[type="text"].search');

          if (searchInput) {
            searchInput.value = track.album;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    ];

    const currentPlaylist = this.props.currentPlaylist;

    if (type === 'playlist' && currentPlaylist) {
      template.push(
        {
          type: 'separator'
        },
        {
          label: 'Remove from playlist',
          click: async () => {
            await PlaylistsActions.removeTracks(currentPlaylist, selected);
          }
        }
      );
    }

    template.push(
      {
        type: 'separator'
      },
      {
        label: 'Show in file manager',
        click: () => {
          shell.showItemInFolder(track.path);
        }
      },
      {
        label: 'Remove from library',
        click: () => {
          LibraryActions.remove(selected);
        }
      }
    );

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  startPlayback = async (_id: string) => {
    await PlayerActions.start(this.props.tracks, _id);
  }

  render () {
    const { tracks, type } = this.props;

    return (
      <div className={styles.tracksList}>
        <KeyBinding onKey={this.onKey} preventInputConflict />
        <TracksListHeader enableSort={type === 'library'} />
        <CustomScrollbar
          className={styles.tracksListBody}
          onScroll={this.onScroll}
        >
          <div
            className={styles.tiles}
            role='listbox'
            style={{ height: tracks.length * ROW_HEIGHT }}
          >
            { this.getTrackTiles() }
          </div>
        </CustomScrollbar>
      </div>
    );
  }
}

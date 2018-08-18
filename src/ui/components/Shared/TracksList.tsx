import electron from 'electron';
import React, { Component } from 'react';
import KeyBinding from 'react-keybinding-component';
import chunk from 'lodash/chunk';

import TrackRow from './TrackRow';
import CustomScrollbar from './CustomScrollbar';
import TracksListHeader from './TracksListHeader';

import * as LibraryActions from '../../actions/LibraryActions';
import * as PlaylistsActions from '../../actions/PlaylistsActions';
import * as PlayerActions from '../../actions/PlayerActions';
import * as QueueActions from '../../actions/QueueActions';

import * as utils from '../../utils/utils';
import { isCtrlKey } from '../../utils/utils-platform';
import { PlaylistModel, TrackModel, PlayerStatus } from '../../typings/interfaces';

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
  currentPlaylist?: string,
}

interface State {
  selected: string[];
  tilesScrolled: number;
}


export default class TracksList extends Component<Props, State> {
  static defaultProps = {
    currentPlaylist: '',
  };

  static isLeftClick = (e: React.MouseEvent) => e.button === 0;
  static isRightClick = (e: React.MouseEvent) => e.button === 2;

  renderView: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      selected: [],
      tilesScrolled: 0,
    };

    this.showContextMenu = this.showContextMenu.bind(this);
    this.startPlayback = this.startPlayback.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.selectTrack = this.selectTrack.bind(this);
    this.onKey = this.onKey.bind(this);
  }

  componentDidMount() {
    this.renderView = document.querySelector('.tracks-list-render-view');
  }

  onScroll() {
    if (this.renderView) {
      const tilesScrolled = Math.floor(this.renderView.scrollTop / TILE_HEIGHT);

      if (this.state.tilesScrolled !== tilesScrolled) {
        this.setState({ tilesScrolled });
      }
    }
  }

  onKey(e: React.KeyboardEvent) {
    const { selected } = this.state;
    const { tracks } = this.props;

    const firstSelectedTrackIdx = tracks.findIndex(track => selected.includes(track._id));

    switch (e.keyCode) {
      case 38: // up
        e.preventDefault();
        this.onUp(firstSelectedTrackIdx, tracks);
        break;

      case 40: // down
        e.preventDefault();
        this.onDown(firstSelectedTrackIdx, tracks);
        break;

      case 13: // enter
        e.preventDefault();
        this.onEnter(firstSelectedTrackIdx, tracks);
        break;
      default:
        break;
    }
  }

  onUp(i: number, tracks: TrackModel[]) {
    if (i - 1 >= 0) {
      this.setState({ selected: [tracks[i - 1]._id] }, () => {
        const container = document.querySelector('.tracks-list .tracks-list-render-view');
        const nodeOffsetTop = (i - 1) * ROW_HEIGHT;

        if (container && container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
      });
    }
  }

  onDown(i: number, tracks: TrackModel[]) {
    if (i + 1 < tracks.length) {
      this.setState({ selected: [tracks[i + 1]._id] }, () => {
        const container: HTMLDivElement | null = document.querySelector('.tracks-list .tracks-list-render-view');
        const nodeOffsetTop = (i + 1) * ROW_HEIGHT;

        if (container && container.scrollTop + container.offsetHeight <= nodeOffsetTop + ROW_HEIGHT) {
          container.scrollTop = (nodeOffsetTop - container.offsetHeight) + ROW_HEIGHT;
        }
      });
    }
  }

  onEnter(i: number, tracks: TrackModel[]) {
    if (i !== undefined) PlayerActions.start(tracks, tracks[i]._id);
  }

  getTrackTiles() {
    const { selected, tilesScrolled } = this.state;
    const { trackPlayingId, tracks } = this.props;

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
            onContextMenu={this.showContextMenu}
            onDoubleClick={this.startPlayback}
          />
        );
      });

      const translationDistance = (tilesScrolled * ROW_HEIGHT * CHUNK_LENGTH) + (indexChunk * ROW_HEIGHT * CHUNK_LENGTH);
      const tracksListTileStyles = {
        transform: `translate3d(0, ${translationDistance}px, 0)`,
      };

      return (
        <div
          className="tracks-list-tile"
          key={`chunk-${tracksChunk[0]._id}`}
          style={tracksListTileStyles}
        >
          { list }
        </div>
      );
    });
  }

  isSelectableTrack(id: string) {
    return !this.state.selected.includes(id);
  }

  selectTrack(e: React.MouseEvent, id: string, index: number) {
    if (TracksList.isLeftClick(e) || (TracksList.isRightClick(e) && this.isSelectableTrack(id))) {
      if (isCtrlKey(e)) {
        this.toggleSelectionById(id);
      } else if (e.shiftKey) {
        if (this.state.selected.length === 0) {
          const selected = [id];
          this.setState({ selected });
        } else this.multiSelect(index);
      } else {
        const selected = [id];
        this.setState({ selected });
      }
    }
  }

  toggleSelectionById(id: string) {
    let selected = [...this.state.selected];

    if (selected.includes(id)) {
      // remove track
      selected.splice(selected.indexOf(id), 1);
    } else {
      // add track
      selected.push(id);
    }

    selected = utils.simpleSort(selected, 'asc');
    this.setState({ selected });
  }

  multiSelect(index: number) {
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

    this.setState({ selected: newSelected });
  }

  showContextMenu(_e: React.MouseEvent, index: number) {
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
            const playlistId = await PlaylistsActions.create('New playlist', false);
            PlaylistsActions.addTracksTo(playlistId, selected);
          },
        },
        {
          type: 'separator',
        },
      );

      if (playlists.length === 0) {
        playlistTemplate.push({
          label: 'No playlist',
          enabled: false,
        });
      } else {
        playlists.forEach((playlist) => {
          playlistTemplate.push({
            label: playlist.name,
            click: () => {
              PlaylistsActions.addTracksTo(playlist._id, selected);
            },
          });
        });
      }
    }

    if (playerStatus !== PlayerStatus.STOP) {
      addToQueueTemplate = [
        {
          label: 'Add to queue',
          click: () => {
            QueueActions.addAfter(selected);
          },
        },
        {
          label: 'Play next',
          click: () => {
            QueueActions.addNext(selected);
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
        },
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
        },
      },
    ];

    const currentPlaylist = this.props.currentPlaylist;

    if (type === 'playlist' && currentPlaylist) {
      template.push(
        {
          type: 'separator',
        },
        {
          label: 'Remove from playlist',
          click: () => {
            PlaylistsActions.removeTracks(currentPlaylist, selected);
          },
        },
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
      },
    );

    const context = Menu.buildFromTemplate(template);

    context.popup({}); // Let it appear
  }

  startPlayback(_id: string) {
    PlayerActions.start(this.props.tracks, _id);
  }

  render() {
    const { tracks, type } = this.props;

    return (
      <div className="tracks-list">
        <KeyBinding onKey={this.onKey} preventInputConflict />
        <TracksListHeader enableSort={type === 'library'} />
        <CustomScrollbar
          className="tracks-list-body"
          onScroll={this.onScroll}
        >
          <div
            className="tracks-list-tiles"
            role="listbox"
            style={{ height: tracks.length * ROW_HEIGHT }}
          >
            { this.getTrackTiles() }
          </div>
        </CustomScrollbar>
      </div>
    );
  }
}

import React, { Component } from 'react';
import { connect } from 'react-redux';
import KeyBinding from 'react-keybinding-component';

import TrackRow from './TrackRow.react';
import PlayingIndicator from './PlayingIndicator.react';

import lib from '../../lib';
import utils from '../../../shared/utils/utils';

import { remote } from 'electron';
const { Menu } = remote;

/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

const attachTrackListContextMenu = (data, callback) => {
    let playlistTemplate = [];
    let addToQueueTemplate = [];

    if (data.playlists) {
        playlistTemplate = [
            {
                label: 'Create new playlist...',
                click: () => {
                    callback('createPlaylist');
                }
            }
        ];

        if (data.playlists.length > 0) {
            playlistTemplate.push(
                {
                    type: 'separator'
                }
            );
        }

        data.playlists.forEach((elem) => {
            playlistTemplate.push({
                label: elem.name,
                click: () => {
                    callback('addToPlaylist', {
                        playlistId: elem._id
                    });
                }
            });
        });
    } else {
        playlistTemplate = [
            {
                label: 'Create new playlist...',
                click: () => {
                    callback('createPlaylist');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'No playlist',
                enabled: false
            }
        ];
    }

    if (data.playerStatus !== 'stop') {
        addToQueueTemplate = [
            {
                label: 'Add to queue',
                click: () => {
                    callback('addToQueue');
                }
            },
            {
                label: 'Play next',
                click: () => {
                    callback('playNext');
                }
            },
            {
                type: 'separator'
            }
        ];
    }

    const template = [
        {
            label: data.selectedCount > 1 ? `${data.selectedCount} tracks selected` : `${data.selectedCount} track selected`,
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
            label: `Search for '${data.track.artist[0]}'`,
            click: () => {
                callback('searchFor', { search: data.track.artist[0] });
            }
        },
        {
            label: `Search for '${data.track.album}'`,
            click: () => {
                callback('searchFor', { search: data.track.album });
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Show in file manager',
            click: () => {
                lib.shell.showItemInFolder(data.track.path);
            }
        }
    ];

    if (data.type === 'playlist') template.push({
        label: 'Remove from playlist',
        click: () => {
            callback('removeFromPlaylist');
        }
    });

    const menu = Menu.buildFromTemplate(template);

    menu.popup(remote.getCurrentWindow());
};

class TracksList extends Component {

    static propTypes = {
        type: React.PropTypes.string.isRequired,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        currentPlaylist: React.PropTypes.string,
        playerStatus: React.PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            scrollTop: 0
        };

        this.showContextMenu = this.showContextMenu.bind(this);
        this.scrollTracksList = this.scrollTracksList.bind(this);
        this.selectTrack = this.selectTrack.bind(this);
        this.onKey = this.onKey.bind(this);

        this.rowHeight = 30;
    }

    render() {
        const tracks = [...this.props.tracks];

        // TODO (y.solovyov | KeitIG): TrackListHeader component?
        return (
            <div className='tracks-list-container' tabIndex='0'>
                <KeyBinding onKey={ this.onKey } target={ '.tracks-list-container' } preventInputConflict preventDefault />
                <div className='tracks-list-header'>
                    <div className='track-cell-header cell-track-playing' />
                    <div className='track-cell-header cell-track'>Track</div>
                    <div className='track-cell-header cell-duration'>Duration</div>
                    <div className='track-cell-header cell-artist'>Artist</div>
                    <div className='track-cell-header cell-album'>Album</div>
                    <div className='track-cell-header cell-genre'>Genre</div>
                    <div className='track-cell-header cell-host'>Host</div>
                </div>
                <div className='tracks-list-body' onScroll={ this.scrollTracksList }>
                    <div className='tracks-list-tiles' style={ { height : tracks.length * this.rowHeight } }>
                        { this.buildTrackTiles() }
                    </div>
                </div>
            </div>
        );
    }

    scrollTracksList = () => {
        this.setState({ scrollTop : document.querySelector('.tracks-list-body').scrollTop });
    }

    selectTrack(e, id, index) {
        if (this.isLeftClick(e) || (this.isRightClick(e) && this.isSelectableTrack(id))) {
            if (e.ctrlKey) {
                this.toggleSelectionById(id);
            } else if (e.shiftKey) {
                this.multiSelect(e, id, index);
            } else {
                const selected = [id];
                this.setState({ selected });
            }
        }
    }

    onKey = (e) => {
        const selected = this.state.selected;
        const tracks   = this.props.tracks;

        const firstSelectedTrackIdx = tracks.findIndex((track) => {
            return selected.includes(track._id);
        });

        switch(e.keyCode) {
            case 38: // up
                this.onUp(firstSelectedTrackIdx, tracks);
                break;

            case 40: // down
                this.onDown(firstSelectedTrackIdx, tracks);
                break;

            case 13: // enter
                this.onEnter(firstSelectedTrackIdx, tracks);
                break;
        }
    }

    isLeftClick = (e) => {
        return e.button === 0;
    }

    isRightClick = (e) => {
        return e.button === 2;
    }

    isSelectableTrack(id) {
        return !this.state.selected.includes(id);
    }

    buildTrackTiles = () => {
        const self           = this;
        const selected       = this.state.selected;
        const tracks         = [...this.props.tracks];
        const trackPlayingId = this.props.trackPlayingId;

        const chunkLength = 20;
        const tilesToDisplay = 5;
        const tileHeight = this.rowHeight * chunkLength;

        const tracksChunked = utils.chunkArray(tracks, chunkLength);
        const tilesScrolled = Math.floor(this.state.scrollTop / tileHeight);

        return tracksChunked.splice(tilesScrolled, tilesToDisplay).map((tracksChunk, indexChunk) => {
            const list = tracksChunk.map((track, index) => {
                const trackRowIndex = (tilesScrolled + indexChunk) * chunkLength + index;

                let playingIndicator = undefined;

                if (trackPlayingId === track._id) {
                    playingIndicator = <PlayingIndicator state={ this.pausePlayState() } />;
                }

                return(
                    <TrackRow
                        selected={ selected.includes(track._id) }
                        trackId={ track._id }
                        key={ index }
                        index={ trackRowIndex }
                        onMouseDown={ self.selectTrack }
                        onContextMenu={ self.showContextMenu }
                    >
                        <div className='cell cell-track-playing text-center'>
                            { playingIndicator }
                        </div>
                        <div className='cell cell-track'>
                            { track.title }
                        </div>
                        <div className='cell cell-duration'>
                            { utils.parseDuration(track.duration) }
                        </div>
                        <div className='cell cell-artist'>
                            { track.artist[0] }
                        </div>
                        <div className='cell cell-album'>
                            { track.album }
                        </div>
                        <div className='cell cell-genre'>
                            { track.genre.join(', ') }
                        </div>
                        <div className='cell cell-host'>
                            { track.owner.name || track.owner.hostname }
                        </div>
                    </TrackRow>
                );
            });

            const translationDistance = (tilesScrolled * this.rowHeight * chunkLength) +
                                        (indexChunk * this.rowHeight * chunkLength);
            const tracksListTileStyles = {
                transform: `translate3d(0, ${translationDistance}px, 0)`
            };

            return (
                <div className='tracks-list-tile' key={ indexChunk } style={ tracksListTileStyles }>
                    { list }
                </div>
            );
        });
    }

    pausePlayState = () => {
        return lib.player.isPaused() ? 'pause' : 'play';
    }

    toggleSelectionById(id) {
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

    multiSelect(e, id, index) {
        const self   = this;
        const tracks = this.props.tracks;
        const selected = this.state.selected;

        const selectedInt = [];

        for(let i = 0, length = tracks.length; i < length; i++) {
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
            for(let i = 0; i <= Math.abs(index - base); i++) {
                newSelected.push(tracks[base - i]._id);
            }
        } else if (index > max) {
            for(let i = 0; i <= Math.abs(index - base); i++) {
                newSelected.push(tracks[base + i]._id);
            }
        }

        self.setState({ selected : newSelected });
    }

    onUp(i, tracks) {
        if (i - 1 >= 0) {
            this.setState({ selected : tracks[i - 1]._id }, () => {
                const container = document.querySelector('.tracks-list-container .tracks-list-body');
                const nodeOffsetTop = (i - 1) * this.rowHeight;

                if (container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
            });
        }
    }

    onDown(i, tracks) {
        if (i + 1 < tracks.length) {
            this.setState({ selected : tracks[i + 1]._id }, () => {
                const container = document.querySelector('.tracks-list-container .tracks-list-body');
                const nodeOffsetTop = (i + 1) * this.rowHeight;

                if (container.scrollTop + container.offsetHeight <= nodeOffsetTop) {
                    container.scrollTop = nodeOffsetTop - container.offsetHeight + this.rowHeight;
                }
            });
        }
    }

    onEnter(i, tracks) {
        if (i !== undefined) this.props.start(tracks[i]._id);
    }

    showContextMenu(e, index) {
        let playlistsList = [].concat(this.props.playlists);

        // Hide current playlist if needed
        if (this.props.type === 'playlist') {
            playlistsList = playlistsList.filter((elem) => elem._id !== this.props.currentPlaylist);
        }

        const processClick = (reply, data) => {
            const selected = this.state.selected;
            switch(reply) {
                case 'addToQueue': {
                    this.props.add(selected);
                    break;
                }
                case 'playNext': {
                    this.props.addNext(selected);
                    break;
                }
                case 'addToPlaylist': {
                    const isShown = this.props.type === 'playlist' && data === this.props.currentPlaylist;
                    this.props.addTracksTo(data.playlistId, selected, isShown);
                    break;
                }
                case 'removeFromPlaylist': {
                    if (this.props.type === 'playlist') {
                        this.props.removeTracksFrom(this.props.currentPlaylist, selected);
                    }
                    break;
                }
                case 'createPlaylist': {
                    this.props.create('New playlist', false).then((playlistId) => {
                        const isShown = this.props.type === 'playlist' && data === this.props.currentPlaylist;
                        this.props.addTracksTo(playlistId, selected, isShown);
                    })
                    break;
                }
                case 'searchFor': {
                    // small hack, we can't call actions.library.filterSearch directly
                    // otherwise the search clear button will not appear, because it will not detect an input event on itself
                    const searchInput = document.querySelector('input[type="text"].search');
                    searchInput.value = data.search;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                }
            }
        };

        attachTrackListContextMenu({
            type: this.props.type,
            selectedCount: this.state.selected.length,
            track: this.props.tracks[index],
            playlists: playlistsList,
            playerStatus: this.props.playerStatus
        }, processClick);
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    add: lib.actions.queue.add,
    addNext: lib.actions.queue.addNext,
    addTracksTo: lib.actions.playlists.addTracksTo,
    removeTracksFrom: lib.actions.playlists.removeTracksFrom,
    create: lib.actions.playlists.create,
    addTracksTo: lib.actions.playlists.addTracksTo,
    start: lib.actions.player.start
};

export default connect(stateToProps, dispatchToProps)(TracksList);

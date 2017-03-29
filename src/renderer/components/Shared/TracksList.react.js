import React, { Component } from 'react';
import { connect } from 'react-redux';
import KeyBinding from 'react-keybinding-component';

import TrackRow from './TrackRow.react';
import PlayingIndicator from './PlayingIndicator.react';
import TracksHeaderCell from './TracksHeaderCell.react';

import lib from '../../lib';
import utils from '../../../shared/utils/utils';
import Avatar from '../Avatar';

/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

class TracksList extends Component {

    static propTypes = {
        type: React.PropTypes.string.isRequired,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        currentPlaylist: React.PropTypes.string,
        playStatus: React.PropTypes.string,
        add: React.PropTypes.func,
        addNext: React.PropTypes.func,
        removeTracksFrom: React.PropTypes.func,
        create: React.PropTypes.func,
        addTracksTo: React.PropTypes.func,
        loadAndPlay: React.PropTypes.func,
        setColumnWidth: React.PropTypes.func,
        toggleSort: React.PropTypes.func,
        columns: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            scrollTop: 0,
        };

        this.rowHeight = 30;
    }

    render() {
        const tracks = [...this.props.tracks];
        const { columns, setColumnWidth, toggleSort } = this.props;
        const { width } = this.state;

        // TODO (y.solovyov | KeitIG): TrackListHeader component?
        return (
            <div className='tracks-list-container' tabIndex='0'>
                <KeyBinding onKey={ this.onKey } target={ '.tracks-list-container' } preventInputConflict preventDefault />
                <div className='tracks-list-header'>
                    <div className='track-cell-header cell-track-playing' />
                    { columns.order.map((colId) => {
                        const col = columns.data[colId];
                        return (
                            <TracksHeaderCell 
                               key={ col.id } 
                               id={ col.id } 
                               width={ col.width }
                               className={ `cell-${col.id}` }
                               setColumnWidth={ setColumnWidth }
                               toggleSort={ toggleSort }
                               sort={ col.sort }
                               >
                                { col.name }
                            </TracksHeaderCell>
                        )
                    })}
                </div>
                <div className='tracks-list-body' onScroll={ this.scrollTracksList }>
                    <div className='tracks-list-tiles' style={ { height : tracks.length * this.rowHeight } }>
                        { this.buildTrackTiles() }
                    </div>
                </div>
            </div>
        );
    }

    scrollTracksList = () => this.setState({ scrollTop : document.querySelector('.tracks-list-body').scrollTop });

    selectTrack = (e, id, index) => {
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

    isLeftClick = (e) => e.button === 0;

    isRightClick = (e) => e.button === 2;

    isSelectableTrack = (id) => !this.state.selected.includes(id);

    buildTrackTiles = () => {
        const self           = this;
        const selected       = this.state.selected;
        const tracks         = [...this.props.tracks];
        const trackPlayingId = this.props.trackPlayingId;
        
        const { columns } = this.props;

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
                        <div className='cell cell-track' style={{ width: `${columns.data.track.width}px` }}>
                            { track.title }
                        </div>
                        <div className='cell cell-duration' style={{ width: `${columns.data.duration.width}px` }}>
                            { utils.parseDuration(track.duration) }
                        </div>
                        <div className='cell cell-artist' style={{ width: `${columns.data.artist.width}px` }}>
                            { track.artist[0] }
                        </div>
                        <div className='cell cell-album' style={{ width: `${columns.data.album.width}px` }}>
                            { track.album }
                        </div>
                        <div className='cell cell-genre' style={{ width: `${columns.data.genre.width}px` }}>
                            { track.genre.join(', ') }
                        </div>
                        <div className='cell cell-owner' style={{ width: `${columns.data.owner.width}px` }}>
                            <Avatar name={ track.owner.name || track.owner.hostname } size={ 24 } />
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

    pausePlayState = () => lib.player.isPaused() ? 'pause' : 'play';

    toggleSelectionById = (id) => {
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

    multiSelect = (e, id, index) => {
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

    onUp = (i, tracks) => {
        if (i - 1 >= 0) {
            this.setState({ selected : tracks[i - 1]._id }, () => {
                const container = document.querySelector('.tracks-list-container .tracks-list-body');
                const nodeOffsetTop = (i - 1) * this.rowHeight;

                if (container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
            });
        }
    }

    onDown = (i, tracks) => {
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

    onEnter = (i, tracks) => {
        if (i) this.props.loadAndPlay(tracks[i]._id);
    }

    showContextMenu = (e, index) => {
        let playlistsList = [].concat(this.props.playlists);

        // Hide current playlist if needed
        if (this.props.type === 'playlist') {
            playlistsList = playlistsList.filter((elem) => elem._id !== this.props.currentPlaylist);
        }

        const processClick = ({ reply, data }) => {
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
                    });
                    break;
                }
                case 'searchFor': {
                    // small hack, we can't call actions.tracks.search directly
                    // otherwise the search clear button will not appear, because it will not detect an input event on itself
                    const searchInput = document.querySelector('input[type="text"].search');
                    searchInput.value = data.search;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                }
            }
        };

        lib.contextMenu.trackList({
            type: this.props.type,
            selectedCount: this.state.selected.length,
            track: this.props.tracks[index],
            playlists: playlistsList,
            playStatus: this.props.playStatus
        }).then(processClick);
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    add: lib.actions.queue.add,
    addNext: lib.actions.queue.addNext,
    removeTracksFrom: lib.actions.playlists.removeTracksFrom,
    create: lib.actions.playlists.create,
    addTracksTo: lib.actions.playlists.addTracksTo,
    loadAndPlay: lib.actions.player.loadAndPlay
};

export default connect(stateToProps, dispatchToProps)(TracksList);

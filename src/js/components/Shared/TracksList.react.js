import React, { Component } from 'react';
import Icon from 'react-fontawesome';
import KeyBinding from 'react-keybinding-component';

import TrackRow from './TrackRow.react';

import AppActions from '../../actions/AppActions';

import Player from '../../lib/player';
import utils  from '../../utils/utils';

const ipcRenderer = electron.ipcRenderer;


/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

export default class TracksList extends Component {

    static propTypes = {
        type: React.PropTypes.string.isRequired,
        tracks: React.PropTypes.array,
        trackPlayingId: React.PropTypes.string,
        playlists: React.PropTypes.array,
        currentPlaylist: React.PropTypes.string
    }

    constructor(props) {

        super(props);
        this.state = {
            selected  : [],
            scrollTop : 0
        };

        this.showContextMenu  = this.showContextMenu.bind(this);
        this.scrollTracksList = this.scrollTracksList.bind(this);
        this.selectTrack      = this.selectTrack.bind(this);
        this.onKey            = this.onKey.bind(this);
    }

    render() {

        const self         = this,
            selected       = this.state.selected,
            tracks         = [...this.props.tracks],
            trackPlayingId = this.props.trackPlayingId;

        const chunkLength = 20;
        const tilesToDisplay = 5;
        const tileHeight = 25 * chunkLength;

        const tracksChunked = utils.chunkArray(tracks, chunkLength);
        const tilesScrolled = Math.floor(this.state.scrollTop / tileHeight);

        // TODO (y.solovyov | KeitIG): move to separate method that returns components
        // Tiles and chunks
        const trackTiles = tracksChunked.splice(tilesScrolled, tilesToDisplay).map((tracksChunk, indexChunk) => {

            const list = tracksChunk.map((track, index) => {

                let playing = undefined;

                if(trackPlayingId !== null) {
                    if(track._id === trackPlayingId) playing = <Icon name='volume-up' fixedWidth />;
                    if(track._id === trackPlayingId && Player.getAudio().paused) playing = <Icon name='volume-off' fixedWidth />;
                }

                return(
                    <TrackRow
                        selected={ selected.includes(track._id) }
                        trackId={ track._id }
                        key={ index }
                        index={ (tilesScrolled + indexChunk) * chunkLength + index }
                        onMouseDown={ self.selectTrack }
                        onContextMenu={ self.showContextMenu }
                    >
                        <div className='cell cell-track-playing text-center'>
                            { playing }
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
                    </TrackRow>
                );
            });

            const tracksListTileStyles = {
                transform: `translate3d(0, ${(((tilesScrolled * 25 * chunkLength) + (indexChunk * 25 * chunkLength)))}px, 0)`
            };

            return (
                <div className='tracks-list-tile' key={ indexChunk } style={ tracksListTileStyles }>
                    { list }
                </div>
            );
        });

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
                </div>
                <div className='tracks-list-body' onScroll={ this.scrollTracksList }>
                    <div className='tracks-list-tiles' style={ { height : tracks.length * 25 } }>
                        { trackTiles }
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {

        const self = this;

        ipcRenderer.on('tracksListContextMenuReply', (event, reply, data) => {

            const selected = self.state.selected;

            switch(reply) {
                case 'addToQueue': {
                    AppActions.queue.add(selected);
                    break;
                }
                case 'playNext': {
                    AppActions.queue.addNext(selected);
                    break;
                }
                case 'addToPlaylist': {
                    const isShown = self.props.type === 'playlist' && data === self.props.currentPlaylist;
                    AppActions.playlists.addTracksTo(data.playlistId, selected, isShown);
                    break;
                }
                case 'removeFromPlaylist': {
                    if(self.props.type === 'playlist') {
                        AppActions.playlists.removeTracksFrom(self.props.currentPlaylist, selected);
                    }
                    break;
                }
                case 'createPlaylist': {
                    AppActions.playlists.create('New playlist', false, (playlistId) => {
                        const isShown = self.props.type === 'playlist' && data === self.props.currentPlaylist;
                        AppActions.playlists.addTracksTo(playlistId, selected, isShown);
                    });
                    break;
                }
                case 'searchFor': {
                    // small hack, we can't call AppActions.library.filterSearch directly
                    // otherwise the search clear button will not appear, because it will not detect an input event on itself
                    const searchInput = document.querySelector('input[type="text"].search');
                    searchInput.value = data.search;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                }
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('tracksListContextMenuReply');
    }

    scrollTracksList() {
        this.setState({ scrollTop : document.querySelector('.tracks-list-body').scrollTop });
    }

    selectTrack(e, id, index) {

        const self   = this;
        const tracks = this.props.tracks;

        if(e.button === 0 || (e.button === 2 && !this.state.selected.includes(id))) {
            if(e.ctrlKey) { // add one track in selected tracks

                let selected = [...this.state.selected];

                if(selected.includes(id)) {
                    // remove track
                    selected.splice(selected.indexOf(id), 1);

                } else {
                    // add track
                    selected.push(id);
                }

                selected = utils.simpleSort(selected, 'asc');
                this.setState({ selected });

            } else if (e.shiftKey) { // add multiple tracks in selected tracks

                const selected = this.state.selected;

                switch(selected.length) {
                    case 0: {
                        selected.push(id);
                        this.setState({ selected });
                        break;
                    }
                    case 1: {

                        const onlySelected = selected[0];
                        let onlySelectedIndex;

                        for(let i = 0, length = tracks.length; i < length; i++) { // STH wrong here
                            if(tracks[i]._id === onlySelected) {
                                onlySelectedIndex = i;
                                break;
                            }
                        }

                        if(index < onlySelectedIndex) {
                            for(let i = 1; i <= Math.abs(index - onlySelectedIndex); i++) {
                                selected.push(tracks[onlySelectedIndex - i]._id);
                            }
                        } else if(index > onlySelectedIndex) {
                            for(let i = 1; i <= Math.abs(index - onlySelectedIndex); i++) {
                                selected.push(tracks[onlySelectedIndex + i]._id);
                            }
                        }

                        self.setState({ selected });
                        break;
                    }
                    default: {
                        const selectedInt = [];

                        for(let i = 0, length = tracks.length; i < length; i++) {
                            if(selected.includes(tracks[i]._id)) {
                                selectedInt.push(i);
                            }
                        }

                        let base;
                        const min = Math.min(...selectedInt);
                        const max = Math.max(...selectedInt);

                        if(index < min) {
                            base = max;
                        } else {
                            base = min;
                        }

                        const newSelected = [];

                        if(index < min) {
                            for(let i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(tracks[base - i]._id);
                            }
                        } else if(index > max) {
                            for(let i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(tracks[base + i]._id);
                            }
                        }

                        self.setState({ selected : newSelected });
                        break;
                    }
                }
            } else { // simple select
                const selected = [id];
                this.setState({ selected });
            }
        }
    }

    onKey(e) {

        const selected = this.state.selected,
            tracks     = this.props.tracks;

        let i = 0;

        switch(e.keyCode) { // Todo: fix when node not in dom
            case 38: // up

                for(let length = tracks.length; i < length; i ++) {
                    if(selected.includes(tracks[i]._id)) break;
                }

                if(i - 1 >= 0) {
                    this.setState({ selected : tracks[i - 1]._id }, () => {

                        const container = document.querySelector('.tracks-list-container .tracks-list-body');
                        const nodeOffsetTop = (i - 1) * 25;

                        if(container.scrollTop > nodeOffsetTop) container.scrollTop = nodeOffsetTop;
                    });
                }
                break;

            case 40: // down

                for(let length = tracks.length; i < length; i ++) {
                    if(selected.includes(tracks[i]._id)) break;
                }

                if(i + 1 < tracks.length) {
                    this.setState({ selected : tracks[i + 1]._id }, () => {

                        const container = document.querySelector('.tracks-list-container .tracks-list-body');
                        const nodeOffsetTop = (i + 1) * 25;

                        if(container.scrollTop + container.offsetHeight <= nodeOffsetTop) {
                            container.scrollTop = nodeOffsetTop - container.offsetHeight + 25;
                        }
                    });
                }
                break;

            case 13: // enter

                for(let length = tracks.length; i < length; i++) {
                    if(selected.includes(tracks[i]._id)) break;
                }
                if(i !== undefined) AppActions.library.selectAndPlay(tracks[i]._id);
                break;
        }
    }

    showContextMenu(e, index) {

        let playlistsList = [].concat(this.props.playlists);

        // Hide current playlist if needed
        if(this.props.type === 'playlist') {
            playlistsList = playlistsList.filter((elem) => elem._id !== this.props.currentPlaylist);
        }

        ipcRenderer.send('tracksListContextMenu', JSON.stringify({
            type: this.props.type,
            selectedCount: this.state.selected.length,
            track: this.props.tracks[index],
            playlists: playlistsList
        }));
    }
}

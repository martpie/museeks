import React, { Component } from 'react';
import Icon from 'react-fontawesome';
import KeyBinding from 'react-keybinding-component';

import AppActions from '../../actions/AppActions';

import app   from '../../utils/app';
import utils from '../../utils/utils';

const ipcRenderer = electron.ipcRenderer;



/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

export default class ArtistList extends Component {

    constructor(props) {

        super(props);
        this.state = {
            selected  : [],
            scrollTop : 0
        };

        this.showContextMenu = this.showContextMenu.bind(this);
    }

    render() {

        var self           = this,
            selected       = this.state.selected,
            tracks         = this.props.tracks,
            trackPlayingID = this.props.trackPlayingID;

        var chunkLength = 20;
        var tilesToDisplay = 5;
        var tileHeight = 25 * chunkLength;

        var tracksChunked = utils.chunkArray(tracks, chunkLength);
        var tilesScrolled = Math.floor(this.state.scrollTop / tileHeight)

        // Tiles and chunks
        var trackTiles = tracksChunked.splice(Math.max(0, tilesScrolled - 1), tilesScrolled > 0 ? tilesToDisplay : tilesToDisplay - 1).map((tracksChunk, indexChunk) => {

            var list = tracksChunk.map((track, index) => {

                var playing = undefined;

                if(trackPlayingID != null) {
                    if(track._id == trackPlayingID) playing = <Icon name='volume-up' fixedWidth />;
                    if(track._id == trackPlayingID && app.audio.paused) playing = <Icon name='volume-off' fixedWidth />;
                }

                return(
                    <div
                        className={ selected.indexOf(track._id) != -1 ? 'track selected' : 'track' }
                        key={ index }
                        onMouseDown={ (e) => self.selectTrack(e, track._id, (tilesScrolled + indexChunk) * chunkLength + index) }
                        onDoubleClick={ () => self.selectAndPlay(track._id) }
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
                    </div>
                );
            });

            var invertedTranslation = tilesScrolled > 0 ? 25 * chunkLength : 0;

            return (
                <div className='tracks-list-tile' key={ indexChunk } style={{ transform: 'translate3d(0, ' + (((tilesScrolled * 25 * chunkLength) + (indexChunk * 25 * chunkLength)) - invertedTranslation) + 'px, 0)'}}>
                    { list }
                </div>
            );
        });

        return (
            <div className='tracks-list-container' tabIndex='0'>
                <KeyBinding onKey={ (e) => { this.onKey(e) } } target={ '.tracks-list-container' } preventInputConflict preventDefault />
                <div className='tracks-list-header'>
                    <div className='track-cell-header cell-track-playing'></div>
                    <div className='track-cell-header cell-track'>Track</div>
                    <div className='track-cell-header cell-duration'>Duration</div>
                    <div className='track-cell-header cell-artist'>Artist</div>
                    <div className='track-cell-header cell-album'>Album</div>
                    <div className='track-cell-header cell-genre'>Genre</div>
                </div>
                <div className='tracks-list-body' onScroll={ this.scrollTracksList.bind(this) }>
                    <div className='tracks-list-tiles' style={{ height : tracks.length * 25 }}>
                        { trackTiles }
                    </div>
                </div>
            </div>
        );
    }

    scrollTracksList() {
        this.setState({ scrollTop : document.querySelector('.tracks-list-body').scrollTop });
    }

    selectTrack(e, id, index) {

        var self   = this;
        var tracks = this.props.tracks;

        if(e.button == 0 || (e.button == 2 && this.state.selected.indexOf(id) == -1 )) {
            if(e.ctrlKey) { // add one track in selected tracks

                var selected = this.state.selected.slice();
                if(selected.indexOf(id) > -1) {
                    // remove track
                    selected.splice(selected.indexOf(id), 1);

                } else {
                    // add track
                    selected.push(id);
                }

                selected = utils.simpleSort(selected, 'asc');
                this.setState({ selected : selected });
            }
            else if (e.shiftKey) { // add multiple tracks in selected tracks

                var selected = this.state.selected;

                switch(selected.length) {
                    case 0:
                        selected.push(id);
                        this.setState({ selected : selected });
                        break;
                    case 1:
                        var onlySelected = selected[0];
                        var onlySelectedIndex;

                        for(var i = 0, length = tracks.length; i < length; i++) {
                            if(tracks[i]._id === onlySelected) {
                                onlySelectedIndex = i;
                                break;
                            }
                        }

                        if(index < onlySelectedIndex) {
                            for(var i = 1; i <= Math.abs(index - onlySelectedIndex); i++) {
                                selected.push(tracks[onlySelectedIndex - i]._id);
                            }
                        } else if(index > onlySelectedIndex) {
                            for(var i = 1; i <= Math.abs(index - onlySelectedIndex); i++) {
                                selected.push(tracks[onlySelectedIndex + i]._id);
                            }
                        }

                        self.setState({ selected : selected });
                        break;
                    default:
                        var selectedInt = [];

                        for(var i = 0, length = tracks.length; i < length; i++) {
                            if(selected.indexOf(tracks[i]._id) > -1) {
                                selectedInt.push(i);
                            }
                        }

                        var base;
                        var min = Math.min.apply(Math, selectedInt);
                        var max = Math.max.apply(Math, selectedInt);

                        if(index < min) {
                            base = max;
                        } else {
                            base = min;
                        }
                        var newSelected = [];
                        if(index < min) {
                            for(var i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(tracks[base - i]._id);
                            }
                        } else if(index > max) {
                            for(var i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(tracks[base + i]._id);
                            }
                        }

                        self.setState({ selected : newSelected });
                        break;
                }
            }
            else { // simple select
                var selected = [id];
                this.setState({ selected : selected });
            }
        }
    }

    onKey(e) {

        switch(e.keyCode) {
            case 38: // up
                var selected = this.state.selected,
                    tracks   = this.props.tracks,
                    i        = 0;

                for(var length = tracks.length; i < length; i ++) {
                    if(selected.indexOf(tracks[i]._id) > -1) break;
                }

                if(i - 1 >= 0) {
                    this.setState({ selected : tracks[i - 1]._id });

                    // Scroll if needed
                    var node = document.querySelector('.tracks-list-container .tracks-list-body .track.selected'); // Get the first selected track
                    var container = document.querySelector('.tracks-list-container .tracks-list-body');

                    // TODO Problem if container is not drawned
                    if(node !== null && container !== null && node.getBoundingClientRect().top < container.getBoundingClientRect().top) container.scrollTop -= node.offsetHeight;
                }
                break;

            case 40: // down
                var selected = this.state.selected,
                    tracks   = this.props.tracks,
                    i        = 0;

                for(var length = tracks.length; i < length; i ++) {
                    if(selected.indexOf(tracks[i]._id) > -1) break;
                }

                if(i + 1 < tracks.length) {
                    this.setState({ selected : tracks[i + 1]._id });

                    // Scroll if needed
                    var node = document.querySelector('.tracks-list-container .tracks-list-body .track.selected'); // Get the first selected track
                    var container = document.querySelector('.tracks-list-container .tracks-list-body');

                    if(node !== null && container !== null && node.getBoundingClientRect().bottom > container.getBoundingClientRect().bottom) container.scrollTop += node.offsetHeight;
                }
                break;

            case 13: // enter
                var selected = this.state.selected,
                    tracks   = this.props.tracks,
                    i        = 0;
                for(var length = tracks.length; i < length; i++) {
                    if(selected.indexOf(tracks[i]._id) > -1) break;
                }
                if(i !== undefined) AppActions.library.selectAndPlay(i);
                break;
        }
    }

    selectAndPlay(_id) {
        AppActions.library.selectAndPlay(_id)
    }

    showContextMenu() {

        var items = this.state.selected.length;

        ipcRenderer.send('tracksListContextMenu', items);
    }

    componentDidMount() {

        var self = this;

        ipcRenderer.on('tracksListContextMenuReply', (event, reply) => {

            var selected = self.state.selected;

            switch(reply) {
                case 'addToQueue':
                    AppActions.queue.add(selected);
                    break;
                case 'playNext':
                    AppActions.queue.addNext(selected);
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('tracksListContextMenuReply');
    }
}

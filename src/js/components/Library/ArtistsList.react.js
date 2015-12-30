import React, { Component } from 'react';
import Icon from 'react-fontawesome';
import KeyBinding from 'react-keybinding-component';

import AppActions from '../../actions/AppActions';

import app   from '../../constants/app';
import utils from '../../utils/utils';

const Menu     = electron.remote.Menu;
const MenuItem = electron.remote.MenuItem;



/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

export default class ArtistList extends Component {

    constructor(props) {

        super(props);
        this.state = {
            selected : []
        };

        this.showContextMenu = this.showContextMenu.bind(this);
    }

    render() {

        var self           = this,
            selected       = this.state.selected,
            tracks         = this.props.tracks,
            trackPlayingID = this.props.trackPlayingID;

        var list = tracks.map(function(track, index) {

            var playing = undefined;

            if(trackPlayingID != null) {
                if(track._id == trackPlayingID) playing = <Icon name='volume-up' fixedWidth />;
                if(track._id == trackPlayingID && app.audio.paused) playing = <Icon name='volume-off' fixedWidth />;
            }

            return(
                <tr className={ selected.indexOf(track._id) != -1 ? 'track selected' : 'track' } key={ index } onMouseDown={ (e) => self.selectTrack(e, track._id, index) } onDoubleClick={ () => self.selectAndPlay(index) } onContextMenu={ self.showContextMenu }>
                    <td className='column-trackPlaying text-center'>
                        { playing }
                    </td>
                    <td className='column-track'>
                        { track.title }
                    </td>
                    <td className='column-duration'>
                        { utils.parseDuration(track.duration) }
                    </td>
                    <td className='column-artist'>
                        { track.artist[0] }
                    </td>
                    <td className='column-album'>
                        { track.album }
                    </td>
                    <td className='column-genre'>
                        { track.genre.join(', ') }
                    </td>
                </tr>
            );
        });

        return (
            <div className='tracks-list-container'>
                <KeyBinding onKey={ (e) => { this.onKey(e) } } target={ '.tracks-list' } preventInputConflict preventDefault />
                <table className='table table-striped tracks-list' tabIndex='0'>
                    <thead>
                        <tr>
                            <th className='column-trackPlaying'></th>
                            <th className='column-track'>Track</th>
                            <th className='column-duration'>Duration</th>
                            <th className='column-artist'>Artist</th>
                            <th className='column-album'>Album</th>
                            <th className='column-genre'>Genre</th>
                        </tr>
                    </thead>
                    <tbody>
                        { list }
                    </tbody>
                </table>
            </div>
        );
    }

    selectTrack(e, id, index) {

        var self   = this;
        var tracks = this.props.tracks;

        if(e.button == 0 || (e.button == 2 && this.state.selected.indexOf(id) == -1 )) {
            if(e.ctrlKey) { // add one track in selected tracks
                var selected = this.state.selected;
                selected.push(id);
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

                if(i - 1 >= 0) this.setState({ selected : tracks[i - 1]._id });
                break;

            case 40: // down
                var selected = this.state.selected,
                    tracks   = this.props.tracks,
                    i        = 0;

                for(var length = tracks.length; i < length; i ++) {
                    if(selected.indexOf(tracks[i]._id) > -1) break;
                }

                if(i + 1 < tracks.length) this.setState({ selected : tracks[i + 1]._id });
                break;

            case 13: // enter
                var selected = this.state.selected,
                    tracks   = this.props.tracks,
                    i        = 0;
                for(var length = tracks.length; i < length; i++) {
                    if(selected.indexOf(tracks[i]._id) > -1) break;
                }
                if(i !== undefined) AppActions.selectAndPlay(i);
                break;
        }
    }

    selectAndPlay(index) {
        AppActions.selectAndPlay(index, false)
    }

    showContextMenu() {

        var selected = this.state.selected;
        var context  = new Menu();

        context.append(new MenuItem({ label: selected.length> 1 ? selected.length + ' tracks selected' : selected.length + ' track selected', enabled: false } ));
        context.append(new MenuItem({ type: 'separator' } ));

        context.append(
            new MenuItem(
                {
                    label : 'Add to queue',
                    click :  function() {
                        AppActions.queue.add(selected)
                    }
                }));
        context.append(
            new MenuItem(
                {
                    label : 'Play next',
                    click :  function() {
                        AppActions.queue.addNext(selected)
                    }
                }));

        // Find a better workaround
        setTimeout(() => {
            context.popup();
        }, 50);
    }
}

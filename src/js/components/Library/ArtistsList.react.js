import React, { Component } from 'react';

import remote from 'remote';

var Menu     = remote.require('menu'),
    MenuItem = remote.require('menu-item');

import AppActions from '../../actions/AppActions';

import app   from '../../constants/app';
import utils from '../../utils/utils';



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
    }

    render() {

        var self           = this;
        var selected       = this.state.selected;
        var tracks         = this.props.tracks;
        var trackPlayingID = this.props.trackPlayingID;
        var playing        = null;

        var list = tracks.map(function(track, index) {

            if(trackPlayingID != null) {
                if(track._id == trackPlayingID) var playing = (<i className='fa fa-fw fa-volume-up'></i>);
                if(track._id == trackPlayingID && app.audio.paused) var playing = (<i className='fa fa-fw fa-volume-off'></i>);
            }

            return(
                <tr className={ selected.indexOf(index) != -1 ? 'track selected' : 'track' } key={index} onMouseDown={ self.selectTrack.bind(self, index) } onDoubleClick={ self.selectAndPlay.bind(null, index) } onContextMenu={ self.showContextMenu.bind(self) }>
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
                <table className='table table-striped tracks-list'>
                    <thead>
                        <tr>
                            <th className='column-trackPlaying'}><div><i className={'fa fa-fw'></i></div></th>
                            <th className='column-track'><div>Track</div></th>
                            <th className='column-duration'><div>Duration</div></th>
                            <th className='column-artist'><div>Artist</div></th>
                            <th className='column-album'><div>Album</div></th>
                            <th className='column-genre'><div>Genre</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        { list }
                    </tbody>
                </table>
            </div>
        );
    }

    selectTrack(index, e) {

        var self = this;


        if(e.button == 0 || (e.button == 2 && this.state.selected.indexOf(index) == -1 )) {
            if(e.ctrlKey) { // add a track in selected tracks
                var selected = this.state.selected;
                selected.push(index);
                selected = utils.simpleSort(selected, 'asc');
                this.setState({ selected : selected });
            }
            else if (e.shiftKey) { // add multiple tracks in selected tracks
                var selected = this.state.selected;

                switch(selected.length) {
                    case 0:
                        selected.push(index);
                        this.setState({ selected : selected });
                        break;
                    case 1:
                        var onlySelected = selected[0];
                        if(index < onlySelected) {
                            for(var i = 1; i <= Math.abs(index - onlySelected); i++) {
                                selected.push(onlySelected - i);
                            }
                        } else if(index > onlySelected) {
                            for(var i = 1; i <= Math.abs(index - onlySelected); i++) {
                                selected.push(onlySelected + i);
                            }
                        }

                        selected = utils.simpleSort(selected, 'asc');
                        self.setState({ selected : selected });
                        break;
                    default:
                        var base;
                        var min = Math.min.apply(Math, selected);
                        var max = Math.max.apply(Math, selected);

                        if(index < min) {
                            base = max;
                        } else {
                            base = min;
                        }
                        var newSelected = [];
                        if(index < min) {
                            for(var i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(base - i);
                            }
                        } else if(index > max) {
                            for(var i = 0; i <= Math.abs(index - base); i++) {
                                newSelected.push(base + i);
                            }
                        }

                        newSelected = utils.simpleSort(newSelected, 'asc');
                        self.setState({ selected : newSelected });
                        break;
                }
            }
            else { // simple select
                var selected = [];
                selected.push(index);
                this.setState({ selected : selected });
            }
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

        context.popup(remote.getCurrentWindow());
    }

    /*cursorUp() {

        var selected = this.state.selected;

        if(selected != null && selected.length >= 1) {
            var selected = [Math.min.apply(Math, selected) - 1];
            if(selected >= 0) this.setState({ selected : selected });
        }
    }

    cursorDown() {

        var selected = this.state.selected;

        if(selected != null && selected.length >= 1) {
            var selected = [Math.max.apply(Math, selected) + 1];
            if(selected < this.props.tracks.length) this.setState({ selected : selected });
        }
    }*/
}

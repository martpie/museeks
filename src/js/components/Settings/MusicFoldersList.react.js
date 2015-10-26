import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

import AppActions from '../../actions/AppActions';

import remote from 'remote';

var dialog = remote.require('dialog');



/*
|--------------------------------------------------------------------------
| Child - MusicFoldersList - manage import folders for library
|--------------------------------------------------------------------------
*/

export default class MusicFoldersList extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var self         = this;
        var musicFolders = this.props.musicFolders;

        if(!this.props.refreshingLibrary) {

            var buttonsGroup = (
                <ButtonGroup>
                    <Button bsSize='small' onClick={ this.addFolders.bind(this) }>
                        <i className='fa fa-plus'></i>
                        Import a folder
                    </Button>
                    <Button bsSize='small' onClick={ this.refreshLibrary }>
                        <i className={ !this.props.refreshingLibrary ? 'fa fa-refresh' : 'fa fa-refresh fa-spin' }></i>
                        { !this.props.refreshingLibrary ? 'Refresh Library' : 'Refreshing Library'}
                    </Button>
                    <Button bsSize='small' bsStyle={'danger'} onClick={ this.resetLibrary }>
                        Reset library
                    </Button>
                </ButtonGroup>
            );

        } else {

            var buttonsGroup = (
                <ButtonGroup>
                    <Button bsSize='small' disabled>
                        <i className='fa fa-plus'></i>
                        Import a folder
                    </Button>
                    <Button bsSize='small' disabled>
                        <i className={ !this.props.refreshingLibrary ? 'fa fa-refresh' : 'fa fa-refresh fa-spin' }></i>
                        { !this.props.refreshingLibrary ? 'Refresh Library' : 'Refreshing Library'}
                    </Button>
                    <Button bsSize='small' disabled bsStyle={'danger'}>
                        Reset library
                    </Button>
                </ButtonGroup>
            );
        }


        var list = musicFolders.map(function(folder, i) {
            return(
                <li key={i} ref={ 'musicfolder-' + i }>
                    <i onClick={ this.props.refreshingLibrary ? void(0) : self.removeFolder.bind(self, i) } className={ this.props.refreshingLibrary ? 'fa fa-close delete-libray-folder disabled' : 'fa fa-close delete-libray-folder' }></i>
                    { folder }
                </li>
            );
        }.bind(this));

        return (
            <div className='setting settings-musicfolder'>
                <h4>Library folders</h4>

                <p>You currently have { musicFolders.length } folder{ musicFolders.length < 2 ? '' : 's' } in your library.</p>

                <ul className={ musicFolders.length != 0 ? 'musicfolders-list' : 'musicfolders-list empty'}>
                    { list }
                </ul>

                { buttonsGroup }
            </div>
        );
    }

    addFolders() {

        var self    = this;
        var folders = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']});

        AppActions.library.addFolders(folders);
    }

    removeFolder(i) {
        AppActions.library.removeFolder(this.refs['musicfolder' + i]);
    }

    resetLibrary() {
        AppActions.library.reset();
    }

    refreshLibrary() {
        AppActions.player.stop();
        AppActions.library.refresh();
    }
}

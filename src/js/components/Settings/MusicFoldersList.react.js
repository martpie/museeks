import React, { Component } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import AppActions from '../../actions/AppActions';



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
                        <Icon name='plus' fixedWidth />
                        Import a folder
                    </Button>
                    <Button bsSize='small' onClick={ this.refreshLibrary }>
                        <Icon name='refresh' /> Refresh Library
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
                        <Icon name='plus' />
                        Import a folder
                    </Button>
                    <Button bsSize='small' disabled>
                        <Icon name='refresh' spin /> Refreshing Library
                    </Button>
                    <Button bsSize='small' disabled bsStyle={'danger'}>
                        Reset library
                    </Button>
                </ButtonGroup>
            );
        }


        var list = musicFolders.map(function(folder, i) {
            return(
                <li key={i}>
                    <Icon name='close' className={ this.props.refreshingLibrary ? 'delete-libray-folder disabled' : 'delete-libray-folder' } onClick={ this.props.refreshingLibrary ? void(0) : self.removeFolder.bind(self, i) }  />
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
        AppActions.library.addFolders();
    }

    removeFolder(i) {
        AppActions.library.removeFolder(i);
    }

    resetLibrary() {
        AppActions.library.reset();
    }

    refreshLibrary() {
        AppActions.player.stop();
        AppActions.library.refresh();
    }
}

import React, { Component } from 'react';
import { ButtonGroup, Button, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| Child - SettingsLibrary - manage import folders for library
|--------------------------------------------------------------------------
*/

export default class SettingsLibrary extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let self         = this;
        let musicFolders = this.props.config.musicFolders;

        let buttonsGroup = (
            <ButtonGroup>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.addFolders.bind(this) }>
                    <Icon name='plus' fixedWidth />
                    Add folder(s)
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.refreshLibrary }>
                    <Icon name='refresh' spin={ this.props.refreshingLibrary } /> { this.props.refreshingLibrary ? 'Refreshing Library' : 'Refresh Library' }
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } bsStyle={'danger'} onClick={ this.resetLibrary }>
                    Reset library
                </Button>
            </ButtonGroup>
        );

        let list = musicFolders.map(function(folder, i) {
            return(
                <li key={i}>
                    <Icon name='close' className={ self.props.refreshingLibrary ? 'delete-libray-folder disabled' : 'delete-libray-folder' } onClick={ self.props.refreshingLibrary ? void(0) : self.removeFolder.bind(self, i) }  />
                    { folder }
                </li>
            );
        });

        return (
            <div className='setting settings-musicfolder'>
                <div className='setting-section'>
                    <h4>Folders</h4>
                    <p>You currently have { musicFolders.length } folder{ musicFolders.length < 2 ? '' : 's' } in your library.</p>
                    <ul className={ musicFolders.length != 0 ? 'musicfolders-list' : 'musicfolders-list empty'}>
                        { list }
                    </ul>
                    { buttonsGroup }
                    <ProgressBar className={ this.props.refreshingLibrary ? 'library-refresh-progress' : 'library-refresh-progress hidden'} now={ this.props.refreshProgress } />
                </div>
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
        AppActions.player.stop();
        AppActions.library.reset();
    }

    refreshLibrary() {
        AppActions.player.stop();
        AppActions.library.refresh();
    }
}

import React, { Component } from 'react';
import { ButtonGroup, Button, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import classnames from 'classnames';

import LibraryFolders from './LibraryFolders.react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Child - SettingsLibrary - manage import folders for library
|--------------------------------------------------------------------------
*/

export default class SettingsLibrary extends Component {

    static propTypes = {
        config: React.PropTypes.object.isRequired,
        refreshingLibrary: React.PropTypes.bool,
        refreshProgress: React.PropTypes.number
    }

    constructor(props) {

        super(props);

        this.addFolders = this.addFolders.bind(this);
    }

    render() {
        const musicFolders = this.props.config.musicFolders;

        const buttonsGroup = (
            <ButtonGroup>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.addFolders }>
                    <Icon name='plus' fixedWidth />
                    Add folder(s)
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.refreshLibrary }>
                    <Icon name='refresh' spin={ this.props.refreshingLibrary } /> { this.props.refreshingLibrary ? 'Refreshing Library' : 'Refresh Library' }
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } bsStyle={ 'danger' } onClick={ this.resetLibrary }>
                    Reset library
                </Button>
            </ButtonGroup>
        );

        const progressBarClasses = classnames('library-refresh-progress', {
            hidden: !this.props.refreshingLibrary
        });

        return (
            <div className='setting settings-musicfolder'>
                <div className='setting-section'>
                    <h4>Folders</h4>
                    <p>You currently have { musicFolders.length } folder{ musicFolders.length < 2 ? '' : 's' } in your library.</p>
                    <LibraryFolders
                        folders={ musicFolders }
                        refreshingLibrary={ this.props.refreshingLibrary }
                    />
                    { buttonsGroup }
                    <ProgressBar className={ progressBarClasses } now={ this.props.refreshProgress } />
                </div>
            </div>
        );
    }

    addFolders() {
        AppActions.library.addFolders();
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

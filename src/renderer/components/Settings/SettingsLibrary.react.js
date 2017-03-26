import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import classnames from 'classnames';

import LibraryFolders from './LibraryFolders.react';

import lib from '../../lib';


/*
|--------------------------------------------------------------------------
| Child - SettingsLibrary - manage import folders for library
|--------------------------------------------------------------------------
*/

class SettingsLibrary extends Component {

    static propTypes = {
        config: React.PropTypes.object,
        refreshingLibrary: React.PropTypes.bool,
        refreshProgress: React.PropTypes.number
    }

    constructor(props) {
        super(props);
    }

    render() {
        const musicFolders = this.props.musicFolders;

        const buttonsGroup = (
            <ButtonGroup>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.addFolders }>
                    <Icon name='plus' fixedWidth />
                    Add folder(s)
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } onClick={ this.refreshLibrary }>
                    <Icon name='refresh' spin={ this.props.refreshingLibrary } />
                      { this.props.refreshingLibrary ? 'Refreshing Library' : 'Refresh Library' }
                </Button>
                <Button bsSize='small' disabled={ this.props.refreshingLibrary } bsStyle={ 'danger' } onClick={ this.deleteLibrary }>
                    Delete library
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

    addFolders = () => {
        this.props.addFolders();
    }

    deleteLibrary = () => {
        this.props.stop();
        this.props.remove();
    }

    refreshLibrary = () => {
        this.props.stop();
        this.props.rescan();
    }
}

const stateToProps = (state) => ({
    musicFolders: state.config.musicFolders,
    refreshProgress: state.library.refreshProgress,
    refreshingLibrary: state.library.refreshingLibrary,
});

const dispatchToProps = {
    stop: lib.actions.player.stop,
    remove: lib.actions.library.remove,
    addFolders: lib.actions.library.addFolders,
    rescan: lib.actions.library.rescan
};

export default connect(stateToProps, dispatchToProps)(SettingsLibrary);

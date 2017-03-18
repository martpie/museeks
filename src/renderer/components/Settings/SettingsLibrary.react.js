import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, ProgressBar } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import classnames from 'classnames';

import LibraryFolders from './LibraryFolders.react';

import { actions } from '../../lib';


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

        this.addFolders = this.addFolders.bind(this);
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
                <div className='setting-section'>
                    <h4>Networked Museek</h4>
                    <p>Connect to other instances of Museek on your network.</p>
                </div>
            </div>
        );
    }

    addFolders = () => {
        this.props.addFolders();
    }

    resetLibrary = () => {
        this.props.stop();
        this.props.reset();
    }

    refreshLibrary = () => {
        this.props.stop();
        this.props.refresh();
    }
}


const stateToProps = (state) => ({
    musicFolders: state.config.musicFolders
});

const dispatchToProps = {
    stop: actions.player.stop,
    reset: actions.library.reset,
    addFolders: actions.library.addFolders,
    refresh: actions.library.refresh
};

export default connect(stateToProps, dispatchToProps)(SettingsLibrary);

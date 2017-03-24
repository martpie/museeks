import React, { Component } from 'react';
import { connect } from 'react-redux';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| LibraryFolders
|--------------------------------------------------------------------------
*/

class LibraryFolders extends Component {

    static propTypes = {
        index: React.PropTypes.number,
        folder: React.PropTypes.string,
        refreshingLibrary: React.PropTypes.bool
    }

    constructor(props) {
        super(props);
    }

    render() {
        const removeButtonClasses = classnames('delete-libray-folder', {
            disabled: this.props.refreshingLibrary
        });

        return (
            <li key={ this.props.index }>
                <Icon name='close'
                      className={ removeButtonClasses }
                      onClick={ this.removeFolder }
                />
            { this.props.folder }
            </li>
        );
    }

    removeFolder = () => {
        this.props.removeFolder(this.props.index);
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    removeFolder: lib.actions.library.removeFolder
};

export default connect(stateToProps, dispatchToProps)(LibraryFolders);

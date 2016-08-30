import React, { Component } from 'react';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| LibraryFolders
|--------------------------------------------------------------------------
*/

export default class LibraryFolders extends Component {

    static propTypes = {
        index: React.PropTypes.number,
        folder: React.PropTypes.string,
        refreshingLibrary: React.PropTypes.bool
    }

    constructor(props) {

        super(props);

        this.removeFolder = this.removeFolder.bind(this);
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

    removeFolder() {
        AppActions.library.removeFolder(this.props.index);
    }
}

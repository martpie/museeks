import React, { PureComponent } from 'react';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| LibraryFolders
|--------------------------------------------------------------------------
*/

export default class LibraryFolders extends PureComponent {

    static propTypes = {
        folders: React.PropTypes.array,
        refreshingLibrary: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
    }

    render() {

        const self = this;

        const foldersListClasses = classnames('musicfolders-list', {
            empty: this.props.folders.length === 0
        });

        // TODO (y.solovyov): move to separate method that returns items
        const removeButtonClasses = classnames('delete-libray-folder', {
            disabled: self.props.refreshingLibrary
        });

        return (
            <ul className={ foldersListClasses }>
                { this.props.folders.map((folder, i) => {
                    return(
                        <li key={ i }>
                            <Icon name='close'
                                  className={ removeButtonClasses }
                                  onClick={ self.removeFolder.bind(self, i) }
                            />
                            { folder }
                        </li>
                    );
                }) }
            </ul>
        );
    }

    removeFolder(index) {
        if (!this.props.refreshingLibrary) {
            AppActions.library.removeFolder(index);
        }
    }
}

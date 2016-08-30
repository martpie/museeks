import React, { Component } from 'react';

import LibraryFolder from './LibraryFolder.react';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| LibraryFolders
|--------------------------------------------------------------------------
*/

export default class LibraryFolders extends Component {

    static propTypes = {
        folders: React.PropTypes.array,
        refreshingLibrary: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
    }

    render() {

        const foldersListClasses = classnames('musicfolders-list', {
            empty: this.props.folders.length === 0
        });

        return (
            <ul className={ foldersListClasses }>
                { this.props.folders.map((folder, i) => {
                    return (
                        <LibraryFolder
                            index={ i }
                            folder={ folder }
                            refreshingLibrary={ this.props.refreshingLibrary }
                        />
                    );
                }
            ) }
            </ul>
        );
    }
}

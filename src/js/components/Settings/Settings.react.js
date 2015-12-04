import React, { Component } from 'react';

import MusicFoldersList from './MusicFoldersList.react';
import ThemeSelector    from './ThemeSelector.react';
import DevMode          from './DevMode.react';
import ContributorsList from './ContributorsList.react';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

export default class Settings extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var config = this.props.config;

        return (
            <div className='view view-settings view-withpadding'>
                <h2>Settings</h2>
                <hr />
                <MusicFoldersList musicFolders={ config.musicFolders } refreshingLibrary={ this.props.refreshingLibrary } refreshProgress={ this.props.refreshProgress } />
                <hr />
                <ThemeSelector theme={ config.theme } />
                <hr />
                <DevMode devMode={ config.devMode } />
                <hr />
                <ContributorsList />
            </div>
        );
    }
}

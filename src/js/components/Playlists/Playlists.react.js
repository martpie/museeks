import React, { Component } from 'react';

import PlaylistsNav from './PlaylistsNav.react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

    static propTypes = {
        params: React.PropTypes.object,
        children: React.PropTypes.object,
        tracks: React.PropTypes.array,
        playlists: React.PropTypes.array
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let content;

        // TODO (y.solovyov): move all these cases to separate components
        if(this.props.playlists === null) {
            content = (
                <div className='full-message'>
                    <p>Loading playlists</p>
                </div>
            );
        } else if(this.props.playlists.length === 0) {
            content = (
                <div className='full-message'>
                    <p>You haven't created any playlist yet</p>
                    <p className='sub-message'>
                        <a onClick={ () => {
                            AppActions.playlists.create('New playlist', true);
                        } }>
                            create one now
                        </a>
                    </p>
                </div>
            );
        } else if(!this.props.params.playlistId) {
            content = (
                <div className='full-message'>
                    <p>Select a playlist in the menu on the left</p>
                </div>
            );
        } else {
            content = React.cloneElement(this.props.children, { ...this.props });
        }

        return (
            <div className='view view-playlists'>
                <PlaylistsNav playlists={ this.props.playlists } />
                <div className='playlist'>
                    { content }
                </div>
            </div>
        );
    }
}

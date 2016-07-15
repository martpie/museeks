import React, { Component } from 'react';

import PlaylistsNav from './PlaylistsNav.react';



/*
|--------------------------------------------------------------------------
| Playlists
|--------------------------------------------------------------------------
*/

export default class Playlists extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let content;

        if(this.props.playlists === null) {
            content = (
                <div className='full-message'>
                    <p>Loading playlists</p>
                </div>
            );
        }
        else if(this.props.playlists.length === 0) {
            content = (
                <div className='full-message'>
                    <p>You haven't created any playlist yet</p>
                </div>
            );
        }
        else if(!this.props.params.id) {
            content = (
                <div className='full-message'>
                    <p>Select a playlist in the menu on the left</p>
                </div>
            );
        }
        else {
            content = React.cloneElement(this.props.children, { ...this.props });
        }

        return (
            <div className='view view-playlists'>
                <PlaylistsNav playlists={ this.props.playlists } />
                <div className='playlist'>
                    { content }
                </div>
            </div>
        );
    }
}

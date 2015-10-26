import React, { Component } from 'react';

import ArtistsList from './ArtistsList.react';



/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

export default class Library extends Component {

    constructor(props) {

        super(props);
        this.state = {}
    }

    render() {

        var content = <p>lala</p>;

        if(this.props.library === null) {
            content = (
                <div className='full-message'>
                    <p>{ 'Loadin\' stuff...' }</p>
                </div>
            );
        }
        else if (this.props.library.length == 0) {
            content = (
                <div className='full-message'>
                    <p>Too bad, there is no music in your library =(</p>
                    <p className='sub-message'>you may need to refresh your library or add folders into it.</p>
                </div>
            );
        }
        else if (this.props.tracks.length == 0) {
            content = (
                <div className='full-message'>
                    <p>Your search returned no results</p>
                </div>
            );
        }
        else {
            content = (
                <div>
                    <ArtistsList
                        playlist={ this.props.playlist }
                        tracks={ this.props.tracks }
                        trackPlayingID={ this.props.trackPlayingID }
                    />
                </div>
            );
        }

        return (
            <div className='view view-library-list' >
                { content }
            </div>
        );
    }
}

import React, { Component } from 'react';
import { Link } from 'react-router';


/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

export default class PlaylistsNavLink extends Component {

    static propTypes = {
        children: React.PropTypes.object,
        playlistId: React.PropTypes.string,
        onContextMenu: React.PropTypes.func
    }

    constructor(props) {

        super(props);

        this.onContextMenu = this.onContextMenu.bind(this);
    }

    render() {

        return (
            <Link
                className='playlist-link'
                activeClassName='active'
                to={ `/playlists/${this.props.playlistId}` }
                onContextMenu={ this.onContextMenu }
            >
                { this.props.children }
            </Link>
        );
    }

    onContextMenu() {
        this.props.onContextMenu(this.props.playlistId);
    }
}

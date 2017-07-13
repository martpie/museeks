import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router';


/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

export default class PlaylistsNavLink extends Component {
    static propTypes = {
        children: PropTypes.string,
        playlistId: PropTypes.string,
        onContextMenu: PropTypes.func,
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

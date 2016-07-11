import PlaylistsActions from '../../actions/PlaylistsActions';

import React, { Component } from 'react';
import { ButtonGroup, Button, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';

const ipcRenderer = electron.ipcRenderer;



/*
|--------------------------------------------------------------------------
| PlaylistsNav
|--------------------------------------------------------------------------
*/

export default class PlaylistsNav extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        const self = this;
        let nav = this.props.playlists.map((elem, index) => {

            return (
                <LinkContainer to={ '/playlists/' + elem._id } key={ index }>
                    <NavItem className='playlist-link' onContextMenu={ self.showContextMenu.bind(self, elem._id) }>
                        { elem.name }
                    </NavItem>
                </LinkContainer>
            );
        });

        return (
            <div className='playlists-nav'>
                <div className='playlists-nav-body'>
                    <Nav stacked handleSelect={ () => {} }>
                        { nav }
                    </Nav>
                </div>
                <div className='playlists-nav-footer'>
                    <ButtonGroup className='playlists-management'>
                        <Button bsStyle='link' bsSize='xs' onClick={ this.createPlaylist }>
                            <Icon name='plus' />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        );
    }

    componentDidMount() {

        let self = this;

        ipcRenderer.on('playlistContextMenuReply', (event, reply, _id) => {

            switch(reply) {
                case 'delete':
                    PlaylistsActions.delete(_id);
                    break;
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('playlistContextMenuReply');
    }

    showContextMenu(_id) {
        ipcRenderer.send('playlistContextMenu', _id);
    }

    createPlaylist() {
        PlaylistsActions.create('New playlist');
    }
}
